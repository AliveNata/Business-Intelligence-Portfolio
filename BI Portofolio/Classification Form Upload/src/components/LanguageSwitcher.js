import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';
import flagID from '../assets/flags/flag-id.svg';
import flagEN from '../assets/flags/flag-gb.svg';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';

    const toggleLanguage = () => {
        const newLang = isEnglish ? 'id' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="language-switcher">
            <input 
                type="checkbox" 
                id="language-toggle" 
                className="language-toggle" 
                checked={isEnglish} 
                onChange={toggleLanguage} 
            />
            <label htmlFor="language-toggle" className="language-slider">
                <img src={flagID} alt="Indonesia" className="flag id-flag" />
                <img src={flagEN} alt="English" className="flag en-flag" />
            </label>
        </div>
    );
};

export default LanguageSwitcher;
