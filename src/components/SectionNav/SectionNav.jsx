import "./SectionNav.css";

const SECTIONS = ["hero", "builder", "map", "history", "contact"];

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

export { SECTIONS };
export default SectionNav;