import "./HomePage.css"
import FadeSection from "../../components/FadeSection/FadeSection";

const HomePage = () => {
    return (
        <div>
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
        </div>
    )
}

export default HomePage;