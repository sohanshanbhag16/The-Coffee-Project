import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import "../../pages/IndexCSS.css";

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

export default FadeSection;