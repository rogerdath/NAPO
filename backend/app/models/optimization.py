from geoalchemy2 import Geometry
from sqlalchemy import Column, BigInteger, Text, ARRAY, Numeric, Time, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .base import BaseModel

class Zone(BaseModel):
    """Geographic zones for transport planning."""
    __tablename__ = 'o_zones'

    id = Column(BigInteger, primary_key=True)
    zone_name = Column(Text, nullable=False)
    postal_codes = Column(ARRAY(Text))

    # Relationships
    transporters = relationship('Transporter', back_populates='zone')
    routes = relationship('Route', back_populates='zone')

class Node(BaseModel):
    """Network nodes with spatial data."""
    __tablename__ = 'o_nodes'

    id = Column(BigInteger, primary_key=True)
    node_name = Column(Text, nullable=False)
    location = Column(Geometry('POINT', srid=4326))

    # Relationships
    time_windows = relationship('TimeWindow', back_populates='node')
    origin_distances = relationship('DistanceMatrix', 
                                  foreign_keys='DistanceMatrix.origin_node_id',
                                  back_populates='origin_node')
    destination_distances = relationship('DistanceMatrix', 
                                       foreign_keys='DistanceMatrix.destination_node_id',
                                       back_populates='destination_node')

class TimeWindow(BaseModel):
    """Time windows for operations."""
    __tablename__ = 'o_time_windows'

    id = Column(BigInteger, primary_key=True)
    node_id = Column(BigInteger, ForeignKey('o_nodes.id'))
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Relationships
    node = relationship('Node', back_populates='time_windows')

class DistanceMatrix(BaseModel):
    """Distance and travel time between nodes."""
    __tablename__ = 'o_distance_matrix'

    id = Column(BigInteger, primary_key=True)
    origin_node_id = Column(BigInteger, ForeignKey('o_nodes.id'))
    destination_node_id = Column(BigInteger, ForeignKey('o_nodes.id'))
    distance = Column(Numeric, nullable=False)
    travel_time = Column(Numeric, nullable=False)

    # Relationships
    origin_node = relationship('Node', 
                             foreign_keys=[origin_node_id],
                             back_populates='origin_distances')
    destination_node = relationship('Node', 
                                  foreign_keys=[destination_node_id],
                                  back_populates='destination_distances') 