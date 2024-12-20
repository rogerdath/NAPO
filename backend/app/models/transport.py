from sqlalchemy import Column, BigInteger, Text, Numeric, Float, ForeignKey
from sqlalchemy.orm import relationship

from .base import BaseModel

class Route(BaseModel):
    """Transport routes."""
    __tablename__ = 't_routes'

    id = Column(BigInteger, primary_key=True)
    route_name = Column(Text, nullable=False)
    description = Column(Text)
    zone_id = Column(BigInteger, ForeignKey('o_zones.id'))

    # Relationships
    zone = relationship('Zone', back_populates='routes')
    vehicle_assignments = relationship('VehicleAssignment', back_populates='route')

class Vehicle(BaseModel):
    """Transport vehicles."""
    __tablename__ = 't_vehicles'

    id = Column(BigInteger, primary_key=True)
    vehicle_name = Column(Text, nullable=False)
    capacity = Column(Numeric)
    transporter_id = Column(BigInteger, ForeignKey('t_transporters.id'))

    # Relationships
    transporter = relationship('Transporter', back_populates='vehicles')
    assignments = relationship('VehicleAssignment', back_populates='vehicle')

class Transporter(BaseModel):
    """Transporters and their locations."""
    __tablename__ = 't_transporters'

    id = Column(BigInteger, primary_key=True)
    name = Column(Text, nullable=False)
    base_latitude = Column(Float)
    base_longitude = Column(Float)
    zone_id = Column(BigInteger, ForeignKey('o_zones.id'))

    # Relationships
    zone = relationship('Zone', back_populates='transporters')
    vehicles = relationship('Vehicle', back_populates='transporter')

class VehicleAssignment(BaseModel):
    """Vehicle assignments to routes."""
    __tablename__ = 't_vehicle_assignments'

    id = Column(BigInteger, primary_key=True)
    route_id = Column(BigInteger, ForeignKey('t_routes.id'))
    vehicle_id = Column(BigInteger, ForeignKey('t_vehicles.id'))

    # Relationships
    route = relationship('Route', back_populates='vehicle_assignments')
    vehicle = relationship('Vehicle', back_populates='assignments') 