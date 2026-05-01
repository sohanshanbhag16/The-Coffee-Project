import FadeSection from "../../components/FadeSection/FadeSection";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import CountryCard from "../../components/CountryCard/CountryCard";
import { COFFEE_COUNTRIES } from "../../components/MapOverlay/MapOverlay";
import MapOverlay from "../../components/MapOverlay/MapOverlay";

const MapPage = ({className}) => {
    const [clickedCountry, setClickedCountry] = useState(null);

    return (
        <div className={className}>
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
    )
}

export default MapPage;