from sqlalchemy import Column, BigInteger, Text, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from .base import BaseModel

class PricingRule(BaseModel):
    """General pricing rules."""
    __tablename__ = 'p_pricing_rules'

    id = Column(BigInteger, primary_key=True)
    rule_name = Column(Text, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)

    # Relationships
    start_fees = relationship('StartFee', back_populates='pricing_rule')

class StartFee(BaseModel):
    """Location-based start fees."""
    __tablename__ = 'p_start_fees'

    id = Column(BigInteger, primary_key=True)
    pricing_rule_id = Column(BigInteger, ForeignKey('p_pricing_rules.id'))
    location_type = Column(Text, nullable=False)
    max_fee = Column(Numeric, nullable=False)

    # Relationships
    pricing_rule = relationship('PricingRule', back_populates='start_fees') 