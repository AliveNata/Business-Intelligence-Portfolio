import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FileUpload from "./components/FileUpload";
import TableDisplay from "./components/TableDisplay"; 
import GenerateDisplay from './components/GenerateDisplay';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import './App.css'; 
import './i18n'; // Pastikan untuk mengimpor i18n agar diterapkan di seluruh aplikasi


function App() {
    const { t } = useTranslation(); // Gunakan hook useTranslation di sini

    return (
        <Router>
            <div className="App">
                <h1>SIMAJA</h1>
                <LanguageSwitcher />
                <Routes>
                    <Route path="/" element={<FileUpload />} />
                    <Route path="/table" element={<TableDisplay />} /> {/* Rute untuk tampilan tabel */}
                    <Route path="/generate-display" element={<GenerateDisplay />} /> {/* Rute untuk tampilan generate */}
                </Routes>
                <footer className="footer">
                    {t('copyright')} 
                </footer>
            </div>
        </Router>
    );
}

export default App;
