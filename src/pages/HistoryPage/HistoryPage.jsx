import FadeSection from "../../components/FadeSection/FadeSection";
import { motion } from "framer-motion";
import { useRef, useLayoutEffect, useState } from "react";
import './HistoryPage.css';

const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const HistoryPage = () => {
    const pinRootRef = useRef(null);
    const trackRef = useRef(null);
    const cardsWrapperRef = useRef(null);

    const [scrollProgress, setScrollProgress] = useState(0);
    const [scrollRunwayPx, setScrollRunwayPx] = useState(null);
    const [maxTranslatePx, setMaxTranslatePx] = useState(0);

    const lastEasedRef = useRef(-1);

    const historyCards = [
        { id: 1, era: "800 AD",  region: "Ethiopian Highlands", title: "Origins in Ethiopia",     description: "Legend speaks of a goat herder named Kaldi who discovered coffee berries after noticing his goats became energized. This humble moment sparked a revolution.", highlight: "Birth of Coffee Culture" },
        { id: 2, era: "15th Century",   region: "Ottoman Empire",      title: "Coffee in the Arab World",           description: "Coffee spread across the Islamic world, becoming central to social gatherings. The first coffeehouses opened in Mecca and Cairo, becoming vibrant centers of intellectual exchange.", highlight: "Coffeehouse Revolution" },
        { id: 3, era: "17th Century",   region: "European Courts",     title: "Arrival in Europe",    description: "Coffee arrived in Europe through Venetian merchants. Despite initial skepticism from the Church, it captivated the elite and became a symbol of enlightenment and progress.", highlight: "European Awakening" },
        { id: 4, era: "18th Century",   region: "Colonial Americas",   title: "Global Expansion and Colonization",      description: "European colonizers planted coffee across the Caribbean and Central America. These regions would become the world's primary coffee producers for centuries to come.", highlight: "Global Cultivation" },
        { id: 5, era: "19th Century",   region: "Industrial Age",      title: "Rise of Coffee Culture", description: "The espresso machine was invented in Italy, revolutionizing how coffee was prepared and consumed. Speed and precision became the hallmarks of modern coffee culture.", highlight: "Birth of Espresso" },
        { id: 6, era: "20th Century",   region: "Modern World",        title: "The Craft",          description: "Coffee evolved from a commodity to an art form. Baristas became artisans, and quality obsession drove a worldwide third-wave movement celebrating origin and technique.", highlight: "Specialty Coffee Era" }
    ];

    useLayoutEffect(() => {
        let raf = 0;

        const scrollTarget =
            typeof document !== "undefined"
                ? document.getElementById("page") ?? window
                : window;

        const isPinnedMode = () =>
            typeof window.matchMedia === "function" &&
            window.matchMedia("(min-width: 769px)").matches;

        const computeMaxTranslatePx = () => {
            const track = trackRef.current;
            const cardsWrapper = cardsWrapperRef.current;
            if (!track || !cardsWrapper) return 0;
            const overflow = cardsWrapper.scrollWidth - track.clientWidth;
            return overflow > 0 ? overflow : 0;
        };

        const update = () => {
            const pinRoot = pinRootRef.current;
            const track = trackRef.current;
            const cardsWrapper = cardsWrapperRef.current;
            if (!pinRoot || !track || !cardsWrapper) return;

            const pinned = isPinnedMode();

            if (!pinned) {
                setScrollRunwayPx((prev) => (prev !== null ? null : prev));
                if (lastEasedRef.current !== 0) {
                    lastEasedRef.current = 0;
                    setScrollProgress(0);
                }
                setMaxTranslatePx((prevMx) => (prevMx !== 0 ? 0 : prevMx));
                return;
            }

            const vh = window.innerHeight;
            const maxTranslate = computeMaxTranslatePx();

            setMaxTranslatePx((prevMx) =>
                Math.abs(prevMx - maxTranslate) > 0.5 ? maxTranslate : prevMx
            );

            const floor = Math.round(vh * 0.5);
            const desired = Math.max(floor, Math.ceil(maxTranslate * 1.08));
            setScrollRunwayPx((prev) => {
                if (prev !== null && Math.abs(prev - desired) <= 12) return prev;
                return desired;
            });

            const rect = pinRoot.getBoundingClientRect();

            // FIX: progress starts exactly when the section pins (rect.top === 0).
            // scrollSpan is only the spacer height (rect.height - vh), not including
            // the sticky panel itself — so there is zero dead scroll at entry.
            const scrollSpan = rect.height - vh;
            const linear =
                scrollSpan <= 1
                    ? 0
                    : Math.min(1, Math.max(0, -rect.top / scrollSpan));

            const eased = easeInOutCubic(linear);

            if (Math.abs(eased - lastEasedRef.current) > 0.002 || maxTranslate === 0) {
                lastEasedRef.current = eased;
                setScrollProgress(eased);
            }
        };

        const schedule = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(update);
        };

        scrollTarget.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);

        let resizeObserver;
        const connectObservers = () => {
            resizeObserver?.disconnect();
            if (typeof ResizeObserver === "undefined") return;
            const pinRoot = pinRootRef.current;
            const track = trackRef.current;
            const cardsWrapper = cardsWrapperRef.current;
            resizeObserver = new ResizeObserver(schedule);
            if (pinRoot) resizeObserver.observe(pinRoot);
            if (track) resizeObserver.observe(track);
            if (cardsWrapper) resizeObserver.observe(cardsWrapper);
        };

        connectObservers();
        queueMicrotask(() => {
            connectObservers();
            schedule();
        });

        return () => {
            scrollTarget.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            resizeObserver?.disconnect();
            cancelAnimationFrame(raf);
        };
    }, []);

    const xOffset = -scrollProgress * maxTranslatePx;

    return (
        <div>
            <FadeSection className="history" id="history" fade={false}>
                <div className="history-pin-root" ref={pinRootRef}>
                    <div className="history-scroll-container">
                        <div className="history-header">
                            <h3 className="history-tagline">THE BEGINNING</h3>
                            <h2 className="history-caption-1">A journey steeped in time</h2>
                        </div>

                        <div className="history-scroll-track" ref={trackRef}>
                            <motion.div
                                ref={cardsWrapperRef}
                                className="history-cards-wrapper"
                                style={{ x: xOffset }}
                                transition={{ type: "tween", duration: 0, ease: "linear" }}
                            >
                                {historyCards.map((card, index) => (
                                    <motion.div
                                        key={card.id}
                                        className="history-card"
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.05 }}
                                        viewport={{ once: false, amount: 0.3 }}
                                    >
                                        <div className="era-badge">
                                            <span className="era-dot"></span>
                                            <span className="era-text">{card.era}</span>
                                        </div>
                                        <div className="card-content">
                                            <p className="region">{card.region}</p>
                                            <h3 className="card-title">{card.title}</h3>
                                            <p className="card-description">{card.description}</p>
                                            <div className="highlight-tag">
                                                <span className="highlight-dot"></span>
                                                {card.highlight}
                                            </div>
                                        </div>
                                        <div className="card-border"></div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        {/* <div className="scroll-progress-bar">
                            <motion.div
                                className="progress-fill"
                                style={{ width: `${scrollProgress * 100}%` }}
                                transition={{ type: "tween", duration: 0, ease: "linear" }}
                            />
                        </div> */}
                    </div>

                    {/* Spacer: only the runway, NOT an extra vh — sticky panel provides its own vh */}
                    <div
                        className="history-spacer"
                        aria-hidden="true"
                        style={
                            scrollRunwayPx != null
                                ? { minHeight: scrollRunwayPx, height: scrollRunwayPx }
                                : undefined
                        }
                    />
                </div>
            </FadeSection>
        </div>
    );
};

export default HistoryPage;