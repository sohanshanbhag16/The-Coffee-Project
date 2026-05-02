import "./Header.css"
import { useState, useEffect, useRef } from "react";
import SectionNav, { SECTIONS } from "../SectionNav/SectionNav";

const Header = () => {
    const [activeSection, setActiveSection] = useState(0);
    const scrollSnapLockRef = useRef(null);

    const scrollTo = (id) => {
        const page = document.getElementById("page");
        if (!page) {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            return;
        }

        // Cancel any previous nav
        scrollSnapLockRef.current?.timeouts.forEach(clearTimeout);
        scrollSnapLockRef.current?.abort?.abort?.();
        const ctrl = new AbortController();
        const timeouts = [];
        scrollSnapLockRef.current = { abort: ctrl, timeouts };

        const alignedTopPx = () => {
            const el = document.getElementById(id);
            if (!el) return page.scrollTop;
            return Math.max(
                0,
                Math.round(
                    el.getBoundingClientRect().top -
                        page.getBoundingClientRect().top +
                        page.scrollTop
                )
            );
        };

        // FIX: disable snap so smooth scroll isn't interrupted mid-animation
        page.style.scrollSnapType = "none";

        page.scrollTo({ top: alignedTopPx(), behavior: "smooth" });

        const lock = () => {
            if (ctrl.signal.aborted) return;
            page.scrollTop = alignedTopPx();
        };

        const restoreSnap = () => {
            if (ctrl.signal.aborted) return;
            requestAnimationFrame(lock);
            // FIX: re-enable snap only after scroll has fully settled
            timeouts.push(setTimeout(() => {
                page.style.scrollSnapType = "";
            }, 100));
        };

        page.addEventListener("scrollend", restoreSnap, { once: true, signal: ctrl.signal });

        // Fallback in case scrollend doesn't fire (e.g. already at position)
        timeouts.push(setTimeout(() => {
            if (ctrl.signal.aborted) return;
            requestAnimationFrame(lock);
            page.style.scrollSnapType = "";
        }, 900));

        scrollSnapLockRef.current.timeouts = timeouts;
    };

    const scrollToSection = (index, id) => {
        const clamped = Math.max(0, Math.min(SECTIONS.length - 1, index));
        setActiveSection(clamped);
        scrollTo(id);
    };

    const navTo = (index) => {
        const clamped = Math.max(0, Math.min(SECTIONS.length - 1, index));
        scrollToSection(clamped, SECTIONS[clamped]);
    };

    useEffect(() => {
        const page = document.getElementById("page");
        if (!page) return;

        function topInsidePage(el, pageEl) {
            return (
                el.getBoundingClientRect().top -
                pageEl.getBoundingClientRect().top +
                pageEl.scrollTop
            );
        }

        const updateActive = () => {
            const sentinel = page.scrollTop + page.clientHeight * 0.2;
            let next = 0;
            for (let i = 0; i < SECTIONS.length; i++) {
                const sectionEl = document.getElementById(SECTIONS[i]);
                if (!sectionEl) continue;
                const top = topInsidePage(sectionEl, page);
                if (top <= sentinel) next = i;
            }
            setActiveSection(next);
        };

        updateActive();
        page.addEventListener("scroll", updateActive, { passive: true });
        window.addEventListener("resize", updateActive);
        return () => {
            page.removeEventListener("scroll", updateActive);
            window.removeEventListener("resize", updateActive);
        };
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
                    <a onClick={(e) => { e.preventDefault(); scrollToSection(0, "hero"); }}>Home</a>
                    <a onClick={(e) => { e.preventDefault(); scrollToSection(1, "builder"); }}>Builder</a>
                    <a onClick={(e) => { e.preventDefault(); scrollToSection(2, "map"); }}>Map</a>
                    <a onClick={(e) => { e.preventDefault(); scrollToSection(3, "history"); }}>History</a>
                    <a onClick={(e) => { e.preventDefault(); scrollToSection(4, "contact"); }}>Contact</a>
                </nav>
            </header>
        </div>
    );
};

export default Header;