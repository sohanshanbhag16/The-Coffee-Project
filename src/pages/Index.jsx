import { AnimatePresence, motion, useInView } from "framer-motion";
import { useState, useRef, useEffect } from "react";

import {
    normalizeValues,
    findBestCoffee,
    getMatchPercentage,
} from "../components/Coffee-Engine";

import './IndexCSS.css';

const SECTIONS = ["hero", "builder", "map"];

/* vertical dot + arrow nav */
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

const FadeSection = ({ children, className = "", id }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.15 });

    return (
        <section id={id} className={className}>
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "inherit" }}
            >
                {children}
            </motion.div>
        </section>
    );
};

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

const Index = () => {

    const [espresso, setEspresso] = useState(33);
    const [milk, setMilk] = useState(34);
    const [water, setWater] = useState(0);
    const [foam, setFoam] = useState(33);
    const [activeSection, setActiveSection] = useState(0);

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

    /* track active section via IntersectionObserver */
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
            {/* HEADER */}
            <header className="header">
                <div className="logo">
                    <span className="logo-icon" />
                    <span className="logo-text">The Coffee Project</span>
                </div>

                <nav className="nav">
                    <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo("hero"); }}>Home</a>
                    <a href="#builder" onClick={(e) => { e.preventDefault(); scrollTo("builder"); }}>Builder</a>
                    <a href="#map" onClick={(e) => { e.preventDefault(); scrollTo("map"); }}>Map</a>
                    <a href="#library">Library</a>
                    <a href="#game">Contribute</a>
                </nav>
            </header>

            <SectionNav active={activeSection} onNav={navTo} />

            <div className="page" id="page">

                {/* HERO */}
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

                {/* BUILDER */}
                <FadeSection className="builder" id="builder">
                    <h3 className="builder-tagline">THE BUILDER</h3>
                    <h2 className="builder-caption-1">Adjust proportions</h2>
                    <h2 className="builder-caption-2">Discover the perfect cup</h2>

                    <div className="builder-section">
                        <div className="builder-box">
                            <SliderRow label="FOAM"         value={foam}     setValue={setFoam}     color="#ffffff" />
                            <SliderRow label="HOT WATER"    value={water}    setValue={setWater}    color="#7fbfff" />
                            <SliderRow label="STEAMED MILK" value={milk}     setValue={setMilk}     color="#f5e6d3" />
                            <SliderRow label="ESPRESSO"     value={espresso} setValue={setEspresso} color="#4b2e0c" />
                        </div>

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

                {/* COMPARE */}
                <FadeSection className="map" id="map">
                    <h3 className="builder-tagline">THE MAP</h3>
                    <h2 className="builder-caption-1">Where every brew finds its form</h2>

                </FadeSection>

            </div>
        </div>
    );
};

export default Index;