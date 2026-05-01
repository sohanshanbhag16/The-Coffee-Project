function SliderRow({ label, value, setValue, color }) {
    return (
        <div className="slider-row">
            <div className="slider-header">
                <div className="left">
                    <span className="dot" style={{ background: color }} />
                    <span className="label">{label}</span>
                </div>
                <span className="value">{value}</span>
            </div>

            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="slider"
            />
        </div>
    );
}

export default SliderRow;