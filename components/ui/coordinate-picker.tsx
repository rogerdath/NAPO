"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Crosshair, Map as MapIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const useMap = dynamic(
    () => import('react-leaflet').then((mod) => mod.useMap),
    { ssr: false }
);

interface Coordinate {
    øst: number;
    nord: number;
}

interface CoordinatePickerProps {
    value: Coordinate;
    onChange: (coordinate: Coordinate) => void;
    onValidate?: (coordinate: Coordinate) => boolean;
}

// Convert UTM coordinates to Lat/Lng
function utmToLatLng(øst: number, nord: number) {
    // This is a simplified conversion for UTM zone 33N (Norway)
    // For production, use a proper UTM conversion library
    const lat = (nord - 6400000) / 111111;
    const lng = (øst - 500000) / (111111 * Math.cos(lat * Math.PI / 180));
    return { lat: lat + 57.5, lng: lng + 15 }; // Approximate offset for Norway
}

// Convert Lat/Lng to UTM coordinates
function latLngToUtm(lat: number, lng: number) {
    // This is a simplified conversion for UTM zone 33N (Norway)
    // For production, use a proper UTM conversion library
    const øst = (lng - 15) * 111111 * Math.cos(lat * Math.PI / 180) + 500000;
    const nord = (lat - 57.5) * 111111 + 6400000;
    return { øst, nord };
}

export function CoordinatePicker({ value, onChange, onValidate }: CoordinatePickerProps) {
    const [localValue, setLocalValue] = useState<Coordinate>(value);
    const [error, setError] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [position, setPosition] = useState(() => utmToLatLng(value.øst, value.nord));

    useEffect(() => {
        setLocalValue(value);
        setPosition(utmToLatLng(value.øst, value.nord));
    }, [value]);

    const handleChange = (field: keyof Coordinate, val: string) => {
        const numValue = Number(val);
        if (isNaN(numValue)) {
            setError(`Invalid ${field} coordinate`);
            return;
        }

        const newCoordinate = {
            ...localValue,
            [field]: numValue
        };

        if (onValidate && !onValidate(newCoordinate)) {
            setError('Coordinate out of valid range');
            return;
        }

        setError(null);
        setLocalValue(newCoordinate);
        onChange(newCoordinate);
        setPosition(utmToLatLng(newCoordinate.øst, newCoordinate.nord));
    };

    const handleMapClick = (e: any) => {
        const utm = latLngToUtm(e.latlng.lat, e.latlng.lng);
        const newCoordinate = {
            øst: Math.round(utm.øst),
            nord: Math.round(utm.nord)
        };

        if (validateRange(newCoordinate)) {
            setError(null);
            setLocalValue(newCoordinate);
            onChange(newCoordinate);
            setPosition(utmToLatLng(newCoordinate.øst, newCoordinate.nord));
        } else {
            setError('Selected coordinates are out of valid range');
        }
    };

    const validateRange = (coordinate: Coordinate) => {
        // Example validation for UTM coordinates in Norway
        return coordinate.øst >= 0 && coordinate.øst <= 1000000 &&
            coordinate.nord >= 6400000 && coordinate.nord <= 7200000;
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Coordinates
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Øst (X)</label>
                                <Input
                                    type="number"
                                    value={localValue.øst}
                                    onChange={(e) => handleChange('øst', e.target.value)}
                                    placeholder="Enter øst coordinate"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nord (Y)</label>
                                <Input
                                    type="number"
                                    value={localValue.nord}
                                    onChange={(e) => handleChange('nord', e.target.value)}
                                    placeholder="Enter nord coordinate"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-500">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (validateRange(localValue)) {
                                        setError(null);
                                        onChange(localValue);
                                    } else {
                                        setError('Coordinates out of valid range');
                                    }
                                }}
                            >
                                <Crosshair className="h-4 w-4 mr-2" />
                                Validate Coordinates
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowMap(true)}
                            >
                                <MapIcon className="h-4 w-4 mr-2" />
                                Open Map
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p>Valid ranges:</p>
                            <ul className="list-disc list-inside">
                                <li>Øst: 0 - 1,000,000</li>
                                <li>Nord: 6,400,000 - 7,200,000</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showMap} onOpenChange={setShowMap}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Select Location</DialogTitle>
                    </DialogHeader>
                    <div className="h-[500px] relative">
                        {showMap && (
                            <MapContainer
                                center={[position.lat, position.lng]}
                                zoom={6}
                                style={{ height: '100%', width: '100%' }}
                                onClick={handleMapClick}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker
                                    position={[position.lat, position.lng]}
                                    draggable={true}
                                    eventHandlers={{
                                        dragend: (e) => {
                                            const marker = e.target;
                                            const position = marker.getLatLng();
                                            handleMapClick({ latlng: position });
                                        },
                                    }}
                                />
                            </MapContainer>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
} 