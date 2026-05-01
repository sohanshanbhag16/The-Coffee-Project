//Import Styles
import './IndexCSS.css';

import Header from "../components/Header/Header";

//Import pages
import HomePage from "./HomePage/HomePage";
import BuilderPage from "./BuilderPage/BuilderPage";
import MapPage from "./MapPage/MapPage";

const Index = () => {
    return (
        <div>
            <Header />

            <div className="page" id="page">

                <HomePage className="home" />

                <BuilderPage className="builder" />

                <MapPage className="map"/>

            </div>
        </div>
    );
};

export default Index;