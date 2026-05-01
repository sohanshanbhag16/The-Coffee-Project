import SliderRow from "../../components/SliderRow/SliderRow";
import FadeSection from "../../components/FadeSection/FadeSection";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { normalizeValues, findBestCoffee, getMatchPercentage } from "../../components/Coffee-Engine";
import './BuilderPage.css';

const BuilderPage = () => {
    const [espresso, setEspresso] = useState(33);
    const [milk, setMilk] = useState(34);
    const [water, setWater] = useState(0);
    const [foam, setFoam] = useState(33);

    // Normalize the proportions to ensure they sum up to 100% and find the best matching coffee based on the current proportions
    const total = espresso + milk + water + foam || 1;
    const normalize = (val) => (val / total) * 100;

    // Get the best matching coffee and the match percentage based on the current proportions
    const current = normalizeValues({ espresso, milk, water, foam });
    const result = findBestCoffee(current);
    const match = getMatchPercentage(result.score);

    return (
        <div>
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
        </div>
    )
}

export default BuilderPage;