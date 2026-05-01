import { motion } from "framer-motion";
import ProportionBar from "../ProportionBar/ProportionBar";

const CountryCard = ({ data, onClose }) => (
    <motion.div
        className="country-card-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
    >
        <motion.div
            className="country-card"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
        >
            {/* ambient glow in top-left corner */}
            <div className="card-glow" />

            {/* LEFT: country + coffee identity */}
            <div className="card-left">
                <p className="card-country-label">{data.name}</p>
                <h2 className="card-coffee-name">{data.coffee}</h2>
                <p className="card-desc">{data.desc}</p>
            </div>

            {/* RIGHT: espresso / milk / water / foam proportion bars */}
            <div className="card-right">
                <p className="card-props-label">PROPORTIONS</p>
                <ProportionBar label="Espresso" value={data.espresso} color="linear-gradient(90deg, #c67c3a, #e07a3f)" />
                <ProportionBar label="Milk"     value={data.milk}     color="linear-gradient(90deg, #d9c7ae, #c4a882)" />
                <ProportionBar label="Water"    value={data.water}    color="linear-gradient(90deg, #6b9ed1, #4a7fb5)" />
                <ProportionBar label="Foam"     value={data.foam}     color="linear-gradient(90deg, #ece6dd, #d9c7ae)" />
            </div>
        </motion.div>
    </motion.div>
);

export default CountryCard;