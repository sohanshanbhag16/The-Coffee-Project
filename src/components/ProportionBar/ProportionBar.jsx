import { motion } from "framer-motion";

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

export default ProportionBar;