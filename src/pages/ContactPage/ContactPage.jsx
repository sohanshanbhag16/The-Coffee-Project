import FadeSection from "../../components/FadeSection/FadeSection";
import './ContactPage.css';

const ContactPage = () => {

    return (
        <div>
            <FadeSection className="contact" id="contact" fade={false}>
                <div>
                    <div>
                        <div className="contact-header">
                            <h3 className="contact-tagline">INQUIRE WITH US</h3>

                            <div className="contact-centre">
                                <br /><br />
                                <div className="glow-line" />
                                <h1 className="contact-tagline-2">For those who</h1>
                                <h1 className="contact-tagline-2">appreciate the <span className="contact-detail">details.</span></h1>
                                <div className="glow-line" />
                                <a
                                href="mailto:hello@thecoffeeproject.com"
                                className="contact-email"
                                >
                                sohan.shanbhag2006@gmail.com
                                </a>

                                
                            </div>
                        </div>
                        <div className="contact-footer">
                                    BASED GLOBALLY · CRAFTED DIGITALLY
                                </div>
                    </div>
                </div>
            </FadeSection>
        </div>
    );
};

export default ContactPage;