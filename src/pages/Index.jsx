import { AnimatePresence, motion, useInView } from "framer-motion";
import { useState, useRef, useEffect } from "react";

import {
    normalizeValues,
    findBestCoffee,
    getMatchPercentage,
} from "../components/Coffee-Engine";

import './IndexCSS.css';



// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const SECTIONS = ["hero", "builder", "map"];

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
};



// ─── SECTION NAV — fixed right-side dot + arrow navigation ───────────────────

const SectionNav = ({ active, onNav }) => (
    <div className="section-nav">
        <button
            className="nav-arrow"
            onClick={() => onNav(active - 1)}
            disabled={active === 0}
        >
            ↑
        </button>

        {SECTIONS.map((id, i) => (
            <button
                key={id}
                className={`nav-dot ${i === active ? "nav-dot-active" : ""}`}
                onClick={() => onNav(i)}
            />
        ))}

        <button
            className="nav-arrow"
            onClick={() => onNav(active + 1)}
            disabled={active === SECTIONS.length - 1}
        >
            ↓
        </button>
    </div>
);



// ─── MAP OVERLAY — fetches world geo data, renders interactive SVG ────────────

const MapOverlay = ({ onCountryClick }) => {
    const [countries, setCountries] = useState([]);

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

    // build SVG path string, skipping antimeridian jumps (Russia etc.)
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

    return (
        <svg
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
                {countries.map((country, i) => {
                    const id = String(country.id).padStart(3, '0');
                    const data = COFFEE_COUNTRIES[id];
                    const isInteractive = !!data;

                    return (
                        <path
                            key={i}
                            d={pathFromGeometry(country.geometry)}
                            onClick={() => isInteractive && onCountryClick(data.name)}
                            onMouseEnter={e => { if (isInteractive) e.currentTarget.style.fill = "#c67c3a"; }}
                            onMouseLeave={e => { if (isInteractive) e.currentTarget.style.fill = "#3b1e0a"; }}
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
            </g>
        </svg>
    );
};



// ─── FADE SECTION — wraps each page section with framer enter animation ───────

const FadeSection = ({ children, className = "", id, fade = true }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.15 });

    return (
        <section id={id} className={className}>
            <motion.div
                ref={ref}
                initial={fade ? { opacity: 0, y: 24 } : false}
                animate={fade && isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "inherit" }}
            >
                {children}
            </motion.div>
        </section>
    );
};



// ─── SLIDER ROW — single labeled range input used in the builder ──────────────

function SliderRow({ label, value, setValue, color }) {
    return (
        <div className="slider-row">
            <div className="slider-header">
                <div className="left">
                    <span className="dot" style={{ background: color }} />
                    <span className="label">{label}</span>
                </div>
                <span className="value">{value}</span>
            </div>

            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="slider"
            />
        </div>
    );
}



// ─── PROPORTION BAR — animated horizontal bar used inside CountryCard ─────────

const ProportionBar = ({ label, value, color }) => (
    <div className="prop-row">
        <span className="prop-label">{label}</span>
        <div className="prop-track">
            <motion.div
                className="prop-fill"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                style={{ background: color }}
            />
        </div>
        <span className="prop-value">{value}%</span>
    </div>
);



// ─── COUNTRY CARD — modal shown when a coffee country is clicked on the map ───

const CountryCard = ({ data, onClose }) => (
    <motion.div
        className="country-card-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
    >
        <motion.div
            className="country-card"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
        >
            {/* ambient glow in top-left corner */}
            <div className="card-glow" />

            {/* LEFT: country + coffee identity */}
            <div className="card-left">
                <p className="card-country-label">{data.name}</p>
                <h2 className="card-coffee-name">{data.coffee}</h2>
                <p className="card-desc">{data.desc}</p>
            </div>

            {/* RIGHT: espresso / milk / water / foam proportion bars */}
            <div className="card-right">
                <p className="card-props-label">PROPORTIONS</p>
                <ProportionBar label="Espresso" value={data.espresso} color="linear-gradient(90deg, #c67c3a, #e07a3f)" />
                <ProportionBar label="Milk"     value={data.milk}     color="linear-gradient(90deg, #d9c7ae, #c4a882)" />
                <ProportionBar label="Water"    value={data.water}    color="linear-gradient(90deg, #6b9ed1, #4a7fb5)" />
                <ProportionBar label="Foam"     value={data.foam}     color="linear-gradient(90deg, #ece6dd, #d9c7ae)" />
            </div>
        </motion.div>
    </motion.div>
);



// ─── INDEX — main page component ──────────────────────────────────────────────

const Index = () => {

    const [espresso, setEspresso] = useState(33);
    const [milk, setMilk] = useState(34);
    const [water, setWater] = useState(0);
    const [foam, setFoam] = useState(33);
    const [activeSection, setActiveSection] = useState(0);
    const [clickedCountry, setClickedCountry] = useState(null);

    const total = espresso + milk + water + foam || 1;
    const normalize = (val) => (val / total) * 100;

    const current = normalizeValues({ espresso, milk, water, foam });
    const result = findBestCoffee(current);
    const match = getMatchPercentage(result.score);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const navTo = (index) => {
        const clamped = Math.max(0, Math.min(SECTIONS.length - 1, index));
        scrollTo(SECTIONS[clamped]);
        setActiveSection(clamped);
    };

    // track which section is in view to update the dot nav
    useEffect(() => {
        const observers = SECTIONS.map((id, i) => {
            const el = document.getElementById(id);
            if (!el) return null;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActiveSection(i); },
                { threshold: 0.5 }
            );
            obs.observe(el);
            return obs;
        });
        return () => observers.forEach(o => o?.disconnect());
    }, []);

    return (
        <div>

            {/* HEADER — fixed, sits above all sections */}
            <header className="header">
                <div className="logo">
                    <span className="logo-icon" />
                    <span className="logo-text">The Coffee Project</span>
                </div>

                <nav className="nav">
                    <a href="#home"    onClick={(e) => { e.preventDefault(); scrollTo("hero");    }}>Home</a>
                    <a href="#builder" onClick={(e) => { e.preventDefault(); scrollTo("builder"); }}>Builder</a>
                    <a href="#map"     onClick={(e) => { e.preventDefault(); scrollTo("map");     }}>Map</a>
                    <a href="#library">Library</a>
                    <a href="#game">Contribute</a>
                </nav>
            </header>


            {/* RIGHT-SIDE DOT NAV */}
            <SectionNav active={activeSection} onNav={navTo} />


            <div className="page" id="page">

                {/* SECTION 1 — HERO */}
                <FadeSection className="hero" id="hero">
                    <p className="tagline">POUR · MIX · DISCOVER</p>

                    <h1 className="title">
                        Every coffee, <span className="accent">distilled</span><br />
                        to its proportions.
                    </h1>

                    <p className="subtitle">
                        Slide a little espresso. Add some milk. Crown it with foam.
                        Watch your drink reveal itself, layer by layer.
                    </p>

                    <button className="cta" onClick={() => scrollTo("builder")}>
                        Start brewing →
                    </button>
                </FadeSection>


                {/* SECTION 2 — BUILDER */}
                <FadeSection className="builder" id="builder">
                    <h3 className="builder-tagline">THE BUILDER</h3>
                    <h2 className="builder-caption-1">Adjust proportions</h2>
                    <h2 className="builder-caption-2">Discover the perfect cup</h2>

                    <div className="builder-section">

                        {/* sliders */}
                        <div className="builder-box">
                            <SliderRow label="FOAM"         value={foam}     setValue={setFoam}     color="#ffffff" />
                            <SliderRow label="HOT WATER"    value={water}    setValue={setWater}    color="#7fbfff" />
                            <SliderRow label="STEAMED MILK" value={milk}     setValue={setMilk}     color="#f5e6d3" />
                            <SliderRow label="ESPRESSO"     value={espresso} setValue={setEspresso} color="#4b2e0c" />
                        </div>

                        {/* glass cup visualisation */}
                        <div className="cup-wrapper" style={{ position: "relative" }}>
                            <div className="steam">
                                <span /><span /><span />
                            </div>
                            <div className="cup">
                                <div className="espresso layer" style={{ height: `${normalize(espresso)}%` }} />
                                <div className="milk    layer" style={{ height: `${normalize(milk)}%` }} />
                                <div className="water   layer" style={{ height: `${normalize(water)}%` }} />
                                <div className="foam    layer" style={{ height: `${normalize(foam)}%` }} />
                            </div>
                        </div>

                        {/* animated coffee name card */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={result.coffee.name}
                                initial={{ opacity: 0, y: 60, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -40, scale: 0.98 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="coffee-card"
                            >
                                <p className="coffee-subtitle">
                                    You're crafting {result.coffee.prefix}
                                </p>

                                <h2 className="coffee-title">
                                    {result.coffee.name}
                                </h2>

                                <p className="coffee-desc">
                                    {result.coffee.description}
                                </p>

                                <div className="coffee-score">
                                    <span className="progress-bar">
                                        <motion.span
                                            className="progress-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${match}%` }}
                                            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 }}
                                        />
                                    </span>

                                    <motion.p
                                        key={match}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {match}% match
                                    </motion.p>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                    </div>
                </FadeSection>


                {/* SECTION 3 — MAP */}
                <FadeSection className="map" id="map" fade={false}>

                    {/* country info card — shown on country click, dismissed on overlay click */}
                    <AnimatePresence>
                        {clickedCountry && (
                            <CountryCard
                                data={clickedCountry}
                                onClose={() => setClickedCountry(null)}
                            />
                        )}
                    </AnimatePresence>

                    <h3 className="builder-tagline">THE MAP</h3>
                    <h2 className="builder-caption-1">Where every brew finds its form</h2>

                    {/* interactive SVG world map */}
                    <MapOverlay onCountryClick={(name) => {
                        const entry = Object.values(COFFEE_COUNTRIES).find(c => c.name === name);
                        if (entry) setClickedCountry(entry);
                    }} />

                </FadeSection>

            </div>
        </div>
    );
};

export default Index;