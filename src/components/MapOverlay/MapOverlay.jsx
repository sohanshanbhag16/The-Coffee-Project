import { useState, useEffect, useRef } from 'react';

const COFFEE_COUNTRIES = {
    "380": { name: "Italy",     coffee: "Espresso",           desc: "Pure, concentrated, unapologetic. The soul of Italian coffee culture in a single shot.", espresso: 100, milk: 0,  water: 0,  foam: 0  },
    "792": { name: "Turkey",    coffee: "Turkish Coffee",     desc: "Unfiltered and bold, brewed in a cezve with cardamom. Ancient ritual in every sip.",      espresso: 80,  milk: 0,  water: 20, foam: 0  },
    "704": { name: "Vietnam",   coffee: "Vietnamese Coffee",  desc: "Dark robusta dripped slow over sweetened condensed milk. Rich, patient, and deeply sweet.", espresso: 60,  milk: 40, water: 0,  foam: 0  },
    "250": { name: "France",    coffee: "Café au Lait",       desc: "Equal parts brewed coffee and warm milk. The gentle morning ritual of Parisian cafés.",    espresso: 50,  milk: 50, water: 0,  foam: 0  },
    "036": { name: "Australia", coffee: "Flat White",         desc: "Velvety microfoam over a double ristretto. Melbourne's gift to the world.",                espresso: 40,  milk: 55, water: 0,  foam: 5  },
    "840": { name: "USA",       coffee: "Americano",          desc: "Espresso stretched with hot water. Long, clean, endlessly drinkable.",                      espresso: 40,  milk: 0,  water: 60, foam: 0  },
    "192": { name: "Cuba",      coffee: "Café Cubano",        desc: "Espresso sweetened with demerara sugar whipped to a frothy paste. Sweet and fierce.",       espresso: 90,  milk: 0,  water: 0,  foam: 10 },
    "300": { name: "Greece",    coffee: "Frappé",             desc: "Instant espresso shaken with ice into a cold foam. Invented by accident, perfected by sun.", espresso: 30,  milk: 20, water: 30, foam: 20 },
    "392": { name: "Japan",     coffee: "Pour-over",          desc: "Precision-brewed, single origin. Each pour a meditation. Clarity over intensity.",         espresso: 0,   milk: 0,  water: 90, foam: 10 },
    "076": { name: "Brazil",    coffee: "Cafézinho",          desc: "Small, sweet, and strong. Served everywhere, anytime. The heartbeat of Brazil.",            espresso: 70,  milk: 10, water: 20, foam: 0  },
    "356": { name: "India",     coffee: "Filter Coffee",      desc: "South Indian delight — chicory-blended, steeped in a brass tumbler, poured from height.",   espresso: 50,  milk: 45, water: 0,  foam: 5  },
    "702": { name: "Singapore", coffee: "Kopi",               desc: "Robusta beans roasted with butter and sugar, dripped strong, served with condensed milk. A hawker centre staple.", espresso: 65,  milk: 35, water: 0,  foam: 0  },
};

// Countries too small to appear as polygons in 110m data — rendered as clickable markers instead
const MARKER_COUNTRIES = [
    { id: "702", lon: 103.82, lat: 1.35 },
];

// Approximate visual centre for each country (lon, lat)
const COUNTRY_CENTERS = {
    "380": [12.57,  41.87],   // Italy
    "792": [35.24,  38.96],   // Turkey
    "704": [108.28, 14.06],   // Vietnam
    "250": [2.21,   46.23],   // France
    "036": [133.78, -25.27],  // Australia
    "840": [-98.58,  39.83],  // USA
    "192": [-79.52,  21.52],  // Cuba
    "300": [21.82,   39.07],  // Greece
    "392": [138.25,  36.20],  // Japan
    "076": [-51.93, -14.24],  // Brazil
    "356": [78.96,   20.59],  // India
};

// ─── MAP OVERLAY ──────────────────────────────────────────────────────────────

const MapOverlay = ({ onCountryClick }) => {
    const [countries, setCountries] = useState([]);
    const [tooltip, setTooltip] = useState(null); // { x, y, name }
    const svgRef = useRef(null);

    useEffect(() => {
        fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
            .then(r => r.json())
            .then(data => {
                import('https://esm.sh/topojson-client@3').then(({ feature }) => {
                    const geojson = feature(data, data.objects.countries);
                    setCountries(geojson.features);
                });
            });
    }, []);

    // equirectangular projection — lon/lat → svg x/y
    const project = ([lon, lat]) => [
        (lon + 180) * (1000 / 360),
        (85 - lat) * (562 / 170)
    ];

    // build SVG path string, skipping antimeridian jumps
    const pathFromGeometry = (geometry) => {
        const rings = geometry.type === 'Polygon'
            ? geometry.coordinates
            : geometry.coordinates.flat(1);

        return rings.map(ring => {
            const points = [];
            for (let i = 0; i < ring.length; i++) {
                const [x, y] = project(ring[i]);
                if (i > 0) {
                    const [px] = project(ring[i - 1]);
                    if (Math.abs(x - px) > 500) {
                        points.push(`M${x.toFixed(1)},${y.toFixed(1)}`);
                        continue;
                    }
                }
                points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
            }
            return points.join(' ') + ' Z';
        }).join(' ');
    };

    const showTooltip = (id, lon, lat) => {
        const data = COFFEE_COUNTRIES[id];
        if (!data) return;
        const [x, y] = project([lon, lat]);
        setTooltip({ x, y, name: data.name });
    };

    const hideTooltip = () => setTooltip(null);

    // Tooltip box dimensions
    const TW = 90, TH = 22, TR = 4;

    return (
        <svg
            ref={svgRef}
            viewBox="-70 -50 1200 650"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                position: "absolute",
                top: 0, left: 0,
                width: "100%", height: "100%",
                zIndex: 0,
                backgroundColor: "#0f0804",
            }}
        >
            <defs>
                <clipPath id="map-clip">
                    <rect x="0" y="0" width="1000" height="562" />
                </clipPath>
            </defs>

            <g clipPath="url(#map-clip)">
                {/* Country polygons */}
                {countries.map((country, i) => {
                    const id = String(country.id).padStart(3, '0');
                    const data = COFFEE_COUNTRIES[id];
                    const isInteractive = !!data;
                    const center = COUNTRY_CENTERS[id];

                    return (
                        <path
                            key={i}
                            d={pathFromGeometry(country.geometry)}
                            onClick={() => isInteractive && onCountryClick(data.name)}
                            onMouseEnter={e => {
                                if (isInteractive) {
                                    e.currentTarget.style.fill = "#c67c3a";
                                    if (center) showTooltip(id, center[0], center[1]);
                                }
                            }}
                            onMouseLeave={e => {
                                if (isInteractive) {
                                    e.currentTarget.style.fill = "#3b1e0a";
                                    hideTooltip();
                                }
                            }}
                            style={{
                                fill: isInteractive ? "#3b1e0a" : "#1a1a1a",
                                stroke: "#0f0804",
                                strokeWidth: 0.5,
                                cursor: isInteractive ? "pointer" : "default",
                                transition: "fill 0.25s ease",
                            }}
                        />
                    );
                })}

                {/* Centre dot markers for all interactive polygon countries */}
                {countries.map((country, i) => {
                    const id = String(country.id).padStart(3, '0');
                    const data = COFFEE_COUNTRIES[id];
                    const center = COUNTRY_CENTERS[id];
                    if (!data || !center) return null;
                    const [x, y] = project(center);
                    return (
                        <circle
                            key={`dot-${i}`}
                            cx={x} cy={y} r={3}
                            fill="#c67c3a"
                            stroke="#0f0804"
                            strokeWidth={0.8}
                            style={{ pointerEvents: "none" }}
                        />
                    );
                })}

                {/* Manual markers for countries too small to render as polygons (e.g. Singapore) */}
                {MARKER_COUNTRIES.map(({ id, lon, lat }) => {
                    const data = COFFEE_COUNTRIES[id];
                    if (!data) return null;
                    const [x, y] = project([lon, lat]);
                    const isHovered = tooltip?.name === data.name;
                    return (
                        <g
                            key={id}
                            onClick={() => onCountryClick(data.name)}
                            onMouseEnter={() => showTooltip(id, lon, lat)}
                            onMouseLeave={hideTooltip}
                            style={{ cursor: "pointer" }}
                        >
                            <circle
                                cx={x} cy={y} r={isHovered ? 7 : 5}
                                fill={isHovered ? "#c67c3a" : "#3b1e0a"}
                                stroke="#c67c3a"
                                strokeWidth={1.5}
                                style={{ transition: "all 0.25s ease" }}
                            />
                            <circle
                                cx={x} cy={y} r={2}
                                fill={isHovered ? "#fff" : "#c67c3a"}
                                style={{ transition: "all 0.25s ease", pointerEvents: "none" }}
                            />
                        </g>
                    );
                })}

                {/* Tooltip — rendered last so it's always on top */}
                {tooltip && (() => {
                    const tx = tooltip.x - TW / 2;
                    const ty = tooltip.y - TH - 14;
                    return (
                        <g style={{ pointerEvents: "none" }}>
                            {/* Callout box */}
                            <rect
                                x={tx} y={ty}
                                width={TW} height={TH}
                                rx={TR} ry={TR}
                                fill="#1a0d05"
                                stroke="#c67c3a"
                                strokeWidth={1}
                                opacity={0.95}
                            />
                            {/* Callout arrow */}
                            <polygon
                                points={`${tooltip.x - 5},${ty + TH} ${tooltip.x + 5},${ty + TH} ${tooltip.x},${ty + TH + 7}`}
                                fill="#1a0d05"
                                stroke="#c67c3a"
                                strokeWidth={1}
                            />
                            <text
                                x={tooltip.x}
                                y={ty + TH / 2 + 4.5}
                                textAnchor="middle"
                                fill="#e8c99a"
                                fontSize={11}
                                fontFamily="Georgia, serif"
                                fontWeight="600"
                                letterSpacing="0.5"
                            >
                                {tooltip.name}
                            </text>
                        </g>
                    );
                })()}
            </g>
        </svg>
    );
};

export { COFFEE_COUNTRIES };
export default MapOverlay;