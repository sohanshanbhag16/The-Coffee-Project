import "./Header.css"
import { useState, useEffect } from "react";
import SectionNav from "../SectionNav/SectionNav";

const Header = () => {
    const [activeSection, setActiveSection] = useState(0);

    const SECTIONS = ["hero", "builder", "map", "history"];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <SectionNav active={activeSection} onNav={navTo} />
            <header className="header">
                <div className="logo">
                    <span className="logo-icon" />
                    <span className="logo-text">The Coffee Project</span>
                </div>

                <nav className="nav">
                    <a onClick={(e) => { e.preventDefault(); scrollTo("hero");    }}>Home</a>
                    <a onClick={(e) => { e.preventDefault(); scrollTo("builder"); }}>Builder</a>
                    <a onClick={(e) => { e.preventDefault(); scrollTo("map");     }}>Map</a>
                    <a onClick={(e) => { e.preventDefault(); scrollTo("history"); }}>History</a>
                    <a href="#game">Contribute</a>
                </nav>
            </header>
        </div>
    )
}

export default Header;