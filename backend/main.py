from fastapi import FastAPI, Query, Request, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import bcrypt
import pandas as pd
import io

# ================= CONFIGURACIÓN DE ENTORNO =================
class Settings(BaseSettings):
    secret_key: str
    admin_default_password: str
    allowed_origins: str 
    
    model_config = SettingsConfigDict(env_file=".env")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

settings = Settings()

# ================= CONFIGURACIÓN DE BASE DE DATOS =================
DATABASE_URL = "sqlite:///./MT_DB.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ================= SEGURIDAD Y JWT =================
SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try: 
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception: 
        return False

# ================= MODELOS DE BASE DE DATOS =================
class RegionModel(Base):
    __tablename__ = "regiones"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)

class CityModel(Base):
    __tablename__ = "ciudades"
    id = Column(String(20), primary_key=True, index=True)  
    nombre = Column(String(100), nullable=False)
    region_id = Column(Integer, ForeignKey("regiones.id", ondelete="CASCADE"), nullable=False)

class HubMappingModel(Base):
    __tablename__ = "hubs_config"
    id = Column(String(50), primary_key=True, index=True) 
    nombre = Column(String(100), nullable=False)
    ciudad_id = Column(String(20), ForeignKey("ciudades.id", ondelete="CASCADE"), nullable=False)  
    direccion = Column(Text, nullable=True)
    coordenadas = Column(String(100), nullable=True)

class UserModel(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="RNOC")
    plazas = Column(String(500), default="*")
    
    # CAMPOS ADMINISTRATIVOS
    num_empleado = Column(String(50), nullable=True)
    correo = Column(String(100), nullable=True)
    area_org = Column(String(100), nullable=True)
    region_asignacion = Column(String(100), nullable=True)
    puesto = Column(String(100), nullable=True)

class PortModel(Base):
    __tablename__ = "inventario_puertos"
    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(50), index=True)
    ciudad = Column(String(50), index=True)
    hub_id = Column(String(50), index=True, nullable=False)
    
    estatus = Column(String(50))
    puerto = Column(String(100), nullable=False)
    equipo_hotel_id = Column(String(100))
    ip_hub = Column(String(50))
    nombre_corto = Column(String(100))
    id_mca = Column(String(100))
    servicio = Column(String(100))
    potencia_hub = Column(String(50))
    potencia_cpe = Column(String(50))
    tipo_servicio = Column(String(100))
    mbps = Column(String(50))
    ip_gestion = Column(String(50))
    ip_cliente = Column(String(50))
    bdi = Column(String(100))
    ruta = Column(Text)
    buffer = Column(String(50))
    hilos = Column(String(50))
    parcheo = Column(String(100))
    lambdas = Column(String(50))
    distancia_cliente = Column(String(50))
    marca_cpe = Column(String(100))
    modelo_cpe = Column(String(100))
    serie_cpe = Column(String(100))
    fecha_entrega = Column(String(100))
    serie_sfp_hub = Column(String(100))
    serie_sfp_client = Column(String(100))
    equipamiento = Column(String(150))
    serie = Column(String(100))
    direccion = Column(Text, nullable=True)  
    coordenadas = Column(String(100), nullable=True)  
    comentarios = Column(Text)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Token inválido o vencido")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise credentials_exception
    except JWTError: raise credentials_exception
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if user is None: raise credentials_exception
    return user

# ================= RUTINAS DE VALIDACIÓN DE ROLES =================
def is_admin(user: UserModel):
    return user.username.lower() == "admin" or str(user.role).strip().upper() == "ADMIN"

def can_edit_ports(user: UserModel):
    return is_admin(user) or str(user.role).strip().upper() in ["MCM NOC", "MCM INGENIERIA"]

def can_upload_excel(user: UserModel):
    return is_admin(user) or str(user.role).strip().upper() == "MCM INGENIERIA"

# ================= ESQUEMAS PYDANTIC =================
class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str
    role: str
    plazas: str = "*"
    num_empleado: str = None
    correo: str = None
    area_org: str = None
    region_asignacion: str = None
    puesto: str = None

class UserUpdate(BaseModel):
    username: str = None
    password: str = None
    role: str = None
    plazas: str = None
    num_empleado: str = None
    correo: str = None
    area_org: str = None
    region_asignacion: str = None
    puesto: str = None

class GeographyRegionCreate(BaseModel):
    nombre: str

class GeographyCityCreate(BaseModel):
    id: str  
    nombre: str
    region_id: int

class GeographyHubCreate(BaseModel):
    id: str
    nombre: str
    ciudad_id: str  
    direccion: str = None
    coordenadas: str = None

class PortUpdate(BaseModel):
    ESTATUS: str = None
    PUERTO: str = None
    EQUIPO_HOTEL_ID: str = None
    IP_HUB: str = None
    NOMBRE_CORTO: str = None
    ID_MCA: str = None
    SERVICIO: str = None
    POTENCIA_HUB: str = None
    POTENCIA_CPE: str = None
    TIPO_SERVICIO: str = None
    MBPS: str = None
    IP_GESTION: str = None
    IP_CLIENTE: str = None
    BDI: str = None
    RUTA: str = None
    BUFFER: str = None
    HILOS: str = None
    PARCHEO: str = None
    LAMBDAS: str = None
    DISTANCIA_CLIENTE: str = None
    MARCA_CPE: str = None
    MODELO_CPE: str = None
    SERIE_CPE: str = None
    FECHA_DE_ENTREGA: str = None
    SERIE_SFP_HUB: str = None
    SERIE_SFP_CLIENTE: str = None
    EQUIPAMIENTO: str = None
    SERIE: str = None
    DIRECCION: str = None  
    COORDENADAS: str = None  
    COMENTARIOS: str = None

# SEED ADMINISTRADOR
db_init = SessionLocal()
if db_init.query(UserModel).count() == 0:
    db_init.add(UserModel(
        username="admin", 
        password_hash=hash_password(settings.admin_default_password), 
        role="ADMIN", 
        plazas="*"
    ))
    db_init.commit()
db_init.close()

app = FastAPI(title="MT_DB Enterprise API")

app.add_middleware(
    CORSMiddleware, 
    allow_origins=settings.cors_origins_list, 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

@app.post("/api/auth/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.username == data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        return JSONResponse(status_code=400, content={"status": "error", "detail": "Credenciales inválidas"})
    access_token = jwt.encode({"sub": user.username, "role": user.role, "plazas": user.plazas, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"status": "success", "token": access_token, "user": {"username": user.username, "role": user.role, "plazas": user.plazas}}

@app.post("/api/auth/register")
def register(data: UserRegister, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
        
    if db.query(UserModel).filter(UserModel.username == data.username.strip()).first(): 
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    db.add(UserModel(
        username=data.username.strip(), password_hash=hash_password(data.password), role=data.role, plazas=data.plazas,
        num_empleado=data.num_empleado, correo=data.correo, area_org=data.area_org,
        region_asignacion=data.region_asignacion, puesto=data.puesto
    ))
    db.commit()
    return {"status": "success"}

@app.get("/api/users")
def list_all_users(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
        
    return [{
        "id": u.id, "username": u.username, "role": u.role, "plazas": u.plazas,
        "num_empleado": u.num_empleado, "correo": u.correo, "area_org": u.area_org,
        "region_asignacion": u.region_asignacion, "puesto": u.puesto
    } for u in db.query(UserModel).all()]

@app.put("/api/users/{user_id}")
def update_user_profile(user_id: int, data: UserUpdate, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
        
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user: raise HTTPException(status_code=404)
        
    if data.username: user.username = data.username.strip()
    if data.role: user.role = data.role
    if data.plazas is not None: user.plazas = data.plazas
    
    if data.num_empleado is not None: user.num_empleado = data.num_empleado
    if data.correo is not None: user.correo = data.correo
    if data.area_org is not None: user.area_org = data.area_org
    if data.region_asignacion is not None: user.region_asignacion = data.region_asignacion
    if data.puesto is not None: user.puesto = data.puesto
    
    if data.password and data.password.strip() != "": 
        user.password_hash = hash_password(data.password)
    db.commit()
    return {"status": "success"}

@app.delete("/api/users/{user_id}")
def delete_user_profile(user_id: int, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user) or current_user.id == user_id: 
        raise HTTPException(status_code=400, detail="Operación no permitida")
        
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user: 
        db.delete(user)
    db.commit()
    return {"status": "success"}

@app.get("/api/geography")
def get_geography_tree(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        ids_permitidos = None if current_user.plazas == "*" else [x.strip().upper() for x in current_user.plazas.split(",") if x.strip()]
        regiones = db.query(RegionModel).all()
        
        query_ciudades = db.query(CityModel)
        if ids_permitidos is not None:
            query_ciudades = query_ciudades.filter(CityModel.id.in_(ids_permitidos))
        ciudades = query_ciudades.all()
        
        if not ciudades: return {}
            
        ids_ciudades_filtradas = [c.id for c in ciudades]
        hubs = db.query(HubMappingModel).filter(HubMappingModel.ciudad_id.in_(ids_ciudades_filtradas)).all()

        hubs_por_ciudad = {}
        for h in hubs:
            if h.ciudad_id not in hubs_por_ciudad: hubs_por_ciudad[h.ciudad_id] = []
            hubs_por_ciudad[h.ciudad_id].append({
                "id": h.id, 
                "nombre": h.nombre, 
                "direccion": h.direccion, 
                "coordenadas": h.coordenadas
            })

        ciudades_por_region = {}
        for c in ciudades:
            if c.region_id not in ciudades_por_region: ciudades_por_region[c.region_id] = []
            ciudades_por_region[c.region_id].append({
                "id": c.id,
                "nombre": c.nombre,
                "hubs": hubs_por_ciudad.get(c.id, [])
            })

        tree = {}
        for r in regiones:
            ciudades_region = ciudades_por_region.get(r.id, [])
            if ids_permitidos is not None and not ciudades_region: continue
                
            tree[r.nombre] = {
                "id": r.id,
                "ciudades": {
                    c["nombre"]: {
                        "id": c["id"], 
                        "hubs": c["hubs"]
                    } for c in ciudades_region
                }
            }
        return tree
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "detail": f"Error leyendo topología: {str(e)}"})

@app.post("/api/geography/regions")
def create_region(data: GeographyRegionCreate, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    nueva = RegionModel(nombre=data.nombre)
    db.add(nueva)
    db.commit()
    return {"status": "success", "id": nueva.id}

@app.put("/api/geography/regions/{region_id}")
def update_region(region_id: int, data: GeographyRegionCreate, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    region = db.query(RegionModel).filter(RegionModel.id == region_id).first()
    if not region: raise HTTPException(status_code=404)
    region.nombre = data.nombre.strip()
    db.commit()
    return {"status": "success"}

@app.delete("/api/geography/regions/{region_id}")
def delete_region(region_id: int, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    region = db.query(RegionModel).filter(RegionModel.id == region_id).first()
    if region:
        ciudades = db.query(CityModel).filter(CityModel.region_id == region_id).all()
        for c in ciudades:
            hubs = db.query(HubMappingModel).filter(HubMappingModel.ciudad_id == c.id).all()
            for h in hubs:
                db.query(PortModel).filter(PortModel.hub_id == h.id).delete()
            db.query(HubMappingModel).filter(HubMappingModel.ciudad_id == c.id).delete()
        db.query(CityModel).filter(CityModel.region_id == region_id).delete()
        db.delete(region)
        db.commit()
    return {"status": "success"}

@app.post("/api/geography/cities")
def create_city(data: GeographyCityCreate, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    if db.query(CityModel).filter(CityModel.id == data.id.upper().strip()).first():
        raise HTTPException(status_code=400, detail="El ID de Ciudad ya se encuentra registrado.")
    db.add(CityModel(id=data.id.upper().strip(), nombre=data.nombre.strip(), region_id=data.region_id))
    db.commit()
    return {"status": "success"}

@app.put("/api/geography/cities/{city_id}")
def update_city(city_id: str, data: GeographyCityCreate, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    ciudad = db.query(CityModel).filter(CityModel.id == city_id).first()
    if not ciudad: raise HTTPException(status_code=404)
    ciudad.nombre = data.nombre.strip()
    ciudad.region_id = data.region_id
    db.commit()
    return {"status": "success"}

@app.post("/api/geography/hubs")
def assign_or_create_hub(data: GeographyHubCreate, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    id_nodo = data.id.upper().strip()
    hub = db.query(HubMappingModel).filter(HubMappingModel.id == id_nodo).first()
    if hub:
        hub.ciudad_id = data.ciudad_id.upper().strip()
        hub.nombre = data.nombre
        hub.direccion = data.direccion
        hub.coordenadas = data.coordenadas
    else:
        db.add(HubMappingModel(
            id=id_nodo, nombre=data.nombre, ciudad_id=data.ciudad_id.upper().strip(), 
            direccion=data.direccion, coordenadas=data.coordenadas
        ))
    db.commit()
    return {"status": "success"}

@app.delete("/api/geography/cities/{city_id}")
def delete_city(city_id: str, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):  
    if not is_admin(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    ciudad = db.query(CityModel).filter(CityModel.id == city_id).first()
    if ciudad:
        hubs = db.query(HubMappingModel).filter(HubMappingModel.ciudad_id == city_id).all()
        for h in hubs: db.query(PortModel).filter(PortModel.hub_id == h.id).delete()
        db.delete(ciudad)
        db.commit()
    return {"status": "success"}

@app.delete("/api/geography/hubs/{hub_id}")
def delete_hub(hub_id: str, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    hub = db.query(HubMappingModel).filter(HubMappingModel.id == hub_id.upper().strip()).first()
    if hub:
        db.query(PortModel).filter(PortModel.hub_id == hub.id).delete()
        db.delete(hub)
        db.commit()
    return {"status": "success"}

# ================= LÍMITES Y VALIDACIONES =================
MAX_EXCEL_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXCEL_MIME_TYPES = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"
}

@app.post("/api/hubs/upload-excel")
def upload_hub_excel(
    id_hub: str = Query(...), 
    file: UploadFile = File(...), 
    current_user: UserModel = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if not can_upload_excel(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
        
    is_valid_mime = file.content_type in ALLOWED_EXCEL_MIME_TYPES
    is_valid_ext = file.filename.lower().endswith(('.xlsx', '.xls'))
    
    if not (is_valid_mime or is_valid_ext):
        return JSONResponse(status_code=400, content={"status": "error", "detail": "El archivo debe ser un Excel válido (.xlsx o .xls)."})
        
    try:
        contents = file.file.read()
        if len(contents) > MAX_EXCEL_FILE_SIZE:
            return JSONResponse(status_code=400, content={"status": "error", "detail": "El archivo supera el límite permitido de 5MB."})
            
        df = pd.read_excel(io.BytesIO(contents), header=None).fillna("")
        
        header_row_idx = 0
        for idx, row in df.iterrows():
            if "PUERTO" in [str(cell).upper().strip() for cell in row.values]:
                header_row_idx = idx
                break
                
        column_headers = [str(cell).upper().strip() for cell in df.iloc[header_row_idx].values]
        df_data = df.iloc[header_row_idx + 1:]
        
        hub_cfg = db.query(HubMappingModel).filter(HubMappingModel.id == str(id_hub).upper().strip()).first()
        if not hub_cfg: return JSONResponse(status_code=400, content={"status": "error", "detail": f"El HUB '{id_hub}' no existe."})
        
        ciudad_obj = db.query(CityModel).filter(CityModel.id == hub_cfg.ciudad_id).first()
        region_obj = db.query(RegionModel).filter(RegionModel.id == ciudad_obj.region_id).first()
        
        def get_index(targets, headers):
            for t in targets:
                if t in headers: return headers.index(t)
            return -1

        idx_status = get_index(["STATUS", "ESTATUS", "ESTADO"], column_headers)
        idx_puerto = get_index(["PUERTO"], column_headers)
        idx_equipo = get_index(["EQUIPO/HOTEL ID", "EQUIPO", "HOTEL ID"], column_headers)
        idx_iphub = get_index(["IP HUB", "IP_HUB"], column_headers)
        idx_ncorto = get_index(["NOMBRE CORTO", "NOMBRE_CORTO"], column_headers)
        idx_idmca = get_index(["ID MCA", "ID_MCA"], column_headers)
        idx_serv = get_index(["SERVICIO"], column_headers)
        idx_pothub = get_index(["POTENCIA HUB", "POTENCIA_HUB"], column_headers)
        idx_potcpe = get_index(["POTENCIA CPE", "POTENCIA_CPE"], column_headers)
        idx_tserv = get_index(["TIPO SERVICIO", "TIPO_SERVICIO"], column_headers)
        idx_mbps = get_index(["MBPS"], column_headers)
        idx_ipgest = get_index(["IP GESTION", "IP_GESTION"], column_headers)
        idx_ipcli = get_index(["IP CLIENTE", "IP_CLIENTE"], column_headers)
        idx_bdi = get_index(["BDI"], column_headers)
        idx_ruta = get_index(["RUTA"], column_headers)
        idx_buff = get_index(["BUFFER"], column_headers)
        idx_hilos = get_index(["HILOS"], column_headers)
        idx_parch = get_index(["PARCHEO"], column_headers)
        idx_lamb = get_index(["LAMBDAS"], column_headers)
        idx_dist = get_index(["DISTANCIA CLIENTE", "DISTANCIA"], column_headers)
        idx_mcpe = get_index(["MARCA CPE", "MARCA_CPE"], column_headers)
        idx_mocpe = get_index(["MODELO CPE", "MODELO_CPE"], column_headers)
        idx_secpe = get_index(["SERIE CPE", "SERIE_CPE"], column_headers)
        idx_fentre = get_index(["FECHA DE ENTREGA", "FECHA_ENTREGA"], column_headers)
        idx_sfphub = get_index(["SERIE SFP HUB", "SERIE_SFP_HUB"], column_headers)
        idx_sfpcli = get_index(["SERIE SFP CLIENTE", "SERIE_SFP_CLIENTE"], column_headers)
        idx_equip = get_index(["EQUIPAMIENTO"], column_headers)
        idx_serie = get_index(["SERIE"], column_headers)
        idx_direccion = get_index(["DIRECCIÓN", "DIRECCION"], column_headers)  
        idx_coordenadas = get_index(["COORDENADAS", "COORDENADA"], column_headers)  
        idx_comentarios = get_index(["COMENTARIOS", "OBSERVACIONES"], column_headers)

        if idx_puerto == -1: return JSONResponse(status_code=400, content={"status": "error", "detail": "Falta columna PUERTO"})

        db.query(PortModel).filter(PortModel.hub_id == str(id_hub).upper().strip()).delete()
        
        for _, row in df_data.iterrows():
            vals = list(row.values)
            if idx_puerto >= len(vals): continue
            p_val = str(vals[idx_puerto]).strip()
            if not p_val or p_val.upper() == "NAN" or p_val == "": continue
            
            def read_val(idx):
                if idx != -1 and idx < len(vals):
                    s = str(vals[idx]).strip()
                    return "" if s.upper() == "NAN" else s
                return ""

            status_raw = read_val(idx_status).upper()
            status_val = status_raw if status_raw else "DISPONIBLE GI"

            db.add(PortModel(
                region=region_obj.nombre, ciudad=ciudad_obj.nombre, hub_id=str(id_hub).upper().strip(),
                estatus=status_val,
                puerto=p_val, equipo_hotel_id=read_val(idx_equipo), ip_hub=read_val(idx_iphub),
                nombre_corto=read_val(idx_ncorto), id_mca=read_val(idx_idmca), servicio=read_val(idx_serv),
                potencia_hub=read_val(idx_pothub), potencia_cpe=read_val(idx_potcpe), tipo_servicio=read_val(idx_tserv),
                mbps=read_val(idx_mbps), ip_gestion=read_val(idx_ipgest), ip_cliente=read_val(idx_ipcli),
                bdi=read_val(idx_bdi), ruta=read_val(idx_ruta), buffer=read_val(idx_buff), hilos=read_val(idx_hilos),
                parcheo=read_val(idx_parch), lambdas=read_val(idx_lamb), distancia_cliente=read_val(idx_dist),
                marca_cpe=read_val(idx_mcpe), modelo_cpe=read_val(idx_mocpe), serie_cpe=read_val(idx_secpe),
                fecha_entrega=read_val(idx_fentre), serie_sfp_hub=read_val(idx_sfphub), serie_sfp_client=read_val(idx_sfpcli),
                equipamiento=read_val(idx_equip), serie=read_val(idx_serie), 
                direccion=read_val(idx_direccion), coordenadas=read_val(idx_coordenadas), comentarios=read_val(idx_comentarios)
            ))
        db.commit()
        return {"status": "success", "detail": "Aprovisionamiento masivo completado."}
    except Exception as e: 
        db.rollback()
        return JSONResponse(status_code=500, content={"status": "error", "detail": f"Fallo en importación: {str(e)}"})
    finally:
        file.file.close()

@app.get("/api/hubs")
def get_hub_ports(id_hub: str = Query("CTC"), db: Session = Depends(get_db)):
    try:
        query_ports = db.query(PortModel).filter(PortModel.hub_id == str(id_hub).strip()).all()
        puertos_lista = []
        for p in query_ports:
            puertos_lista.append({
                "ID": p.id, "REGION": p.region, "CIUDAD": p.ciudad, "ESTATUS": p.estatus, "PUERTO": p.puerto,
                "EQUIPO_HOTEL_ID": p.equipo_hotel_id, "IP_HUB": p.ip_hub, "NOMBRE_CORTO": p.nombre_corto, "ID_MCA": p.id_mca,
                "SERVICIO": p.servicio, "POTENCIA_HUB": p.potencia_hub, "POTENCIA_CPE": p.potencia_cpe, "TIPO_SERVICIO": p.tipo_servicio,
                "MBPS": p.mbps, "IP_GESTION": p.ip_gestion, "IP_CLIENTE": p.ip_cliente, "BDI": p.bdi, "RUTA": p.ruta,
                "BUFFER": p.buffer, "HILOS": p.hilos, "PARCHEO": p.parcheo, "LAMBDAS": p.lambdas, "DISTANCIA_CLIENTE": p.distancia_cliente,
                "MARCA_CPE": p.marca_cpe, "MODELO_CPE": p.modelo_cpe, "SERIE_CPE": p.serie_cpe, "FECHA_DE_ENTREGA": p.fecha_entrega,
                "SERIE_SFP_HUB": p.serie_sfp_hub, "SERIE_SFP_CLIENTE": p.serie_sfp_client, "EQUIPAMIENTO": p.equipamiento, "SERIE": p.serie,
                "DIRECCION": p.direccion, "COORDENADAS": p.coordenadas, "COMENTARIOS": p.comentarios
            })
        
        total_disp = sum(1 for x in puertos_lista if str(x["ESTATUS"]).strip().upper() in ["DISPONIBLE GI", "DISPONIBLE TE"])
        
        return {
            "status": "success", "hub": id_hub, 
            "resumen": {
                "total": len(puertos_lista), 
                "disponibles": total_disp, 
                "activos": sum(1 for x in puertos_lista if "ACTIVO" in str(x["ESTATUS"]).upper()), 
                "suspendidos": sum(1 for x in puertos_lista if "SUSPENDIDO" in str(x["ESTATUS"]).upper()),
                "troncales": sum(1 for x in puertos_lista if "TRONCAL" in str(x["ESTATUS"]).upper())
            }, 
            "puertos": puertos_lista
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "detail": str(e)})

@app.put("/api/ports/{port_id}")
def update_port_data(port_id: int, data: PortUpdate, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    if not can_edit_ports(current_user): 
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
        
    db_port = db.query(PortModel).filter(PortModel.id == port_id).first()
    if not db_port: raise HTTPException(status_code=404)
    for key, val in data.model_dump(exclude_unset=True).items(): 
        attr_name = key.lower()
        if attr_name == "fecha_de_entrega": attr_name = "fecha_entrega"
        if attr_name == "serie_sfp_cliente": attr_name = "serie_sfp_client"
        setattr(db_port, attr_name, val)
    db.commit()
    return {"status": "success"}

@app.get("/api/ports/clients")
def get_clients_status(db: Session = Depends(get_db)):
    try:
        activos = db.query(PortModel).filter(PortModel.estatus == "ACTIVO").all()
        suspendidos = db.query(PortModel).filter(PortModel.estatus == "SUSPENDIDO").all()
        
        def port_to_dict(p):
            return {
                "ID": p.id, "REGION": p.region, "CIUDAD": p.ciudad, "ESTATUS": p.estatus, "PUERTO": p.puerto,
                "EQUIPO_HOTEL_ID": p.equipo_hotel_id, "IP_HUB": p.ip_hub, "NOMBRE_CORTO": p.nombre_corto, "ID_MCA": p.id_mca,
                "SERVICIO": p.servicio, "POTENCIA_HUB": p.potencia_hub, "POTENCIA_CPE": p.potencia_cpe, "TIPO_SERVICIO": p.tipo_servicio,
                "MBPS": p.mbps, "IP_GESTION": p.ip_gestion, "IP_CLIENTE": p.ip_cliente, "BDI": p.bdi, "RUTA": p.ruta,
                "BUFFER": p.buffer, "HILOS": p.hilos, "PARCHEO": p.parcheo, "LAMBDAS": p.lambdas, "DISTANCIA_CLIENTE": p.distancia_cliente,
                "MARCA_CPE": p.marca_cpe, "MODELO_CPE": p.modelo_cpe, "SERIE_CPE": p.serie_cpe, "FECHA_DE_ENTREGA": p.fecha_entrega,
                "SERIE_SFP_HUB": p.serie_sfp_hub, "SERIE_SFP_CLIENTE": p.serie_sfp_client, "EQUIPAMIENTO": p.equipamiento, "SERIE": p.serie,
                "DIRECCION": p.direccion, "COORDENADAS": p.coordenadas, "COMENTARIOS": p.comentarios
            }

        return {
            "status": "success",
            "activos": [port_to_dict(p) for p in activos],
            "suspendidos": [port_to_dict(p) for p in suspendidos]
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "detail": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)