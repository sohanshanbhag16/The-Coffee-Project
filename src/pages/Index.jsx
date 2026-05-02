//Import Styles
import './IndexCSS.css';

import Header from "../components/Header/Header";

//Import pages
import HomePage from "./HomePage/HomePage";
import BuilderPage from "./BuilderPage/BuilderPage";
import MapPage from "./MapPage/MapPage";
import HistoryPage from './HistoryPage/HistoryPage';
import ContactPage from './ContactPage/ContactPage';

const Index = () => {
    return (
        <div>
            <Header />

            <div className="page" id="page">

                <HomePage className="home" />

                <BuilderPage className="builder" />

                <MapPage className="map"/>

                <HistoryPage className="history" />

                <ContactPage className="contact" />
            </div>
        </div>
    );
};

export default Index;