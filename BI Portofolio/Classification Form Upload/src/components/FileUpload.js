import React, { useState } from 'react';
import axios from 'axios';
import templateFile from '../assets/file-template.xlsx'; 
import { useNavigate } from 'react-router-dom'; // Import navigate untuk router ke page terentu
import { useTranslation } from 'react-i18next'; // Import hook untuk i18next
import './FileUpload.css'; 

const FileUpload = () => {
    const { t } = useTranslation(); // Gunakan hook useTranslation untuk multi-bahasa
    const [files, setFiles] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [fileNames, setFileNames] = useState([]); // Tambahkan state untuk nama file
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;
        setFiles(selectedFiles);
        
        // Ambil nama file dan simpan di fileNames
        const names = Array.from(selectedFiles).map(file => file.name);
        setFileNames(names);
    };

    const handleUpload = async () => {
        if (!files) {
            alert(t('select_file_alert'));
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, { // Pastikan endpoint ini benar
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(t('upload_success_message') + ': ' + response.data);
            setErrorMessage('');
            navigate('/table');
        } catch (error) {
            setErrorMessage(t('upload_error_message'));
        }
    };

    const handleNavigateToTable = () => {
        navigate('/table'); // Navigasi ke HasilDisplay
    };

    return (
        <div className="upload-container">
            <h1>{t('btpd_file_upload')}</h1>
            <p className="file-upload-text">
                {t('upload_instruction')} <a href={templateFile} download title={t('template_download_title')}>{t('here')}</a>.
            </p>

            <div className="custom-file-wrapper">
                <label className="custom-file-upload">
                    <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                    {t('choose_files')}
                </label>
                <span className="file-upload-label">
                    {files ? `${fileNames.join(', ')})` : t('no_file_chosen')}
                    {/* {files ? `${fileNames.join(', ')} (${files.length} ${t('files_selected')})` : t('no_file_chosen')} */}
                </span>
            </div>
    
            <div className="button-container">
                <button onClick={handleUpload}>{t('upload_button')}</button>
                <button onClick={handleNavigateToTable}>{t('view_table_button')}</button>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
    );
};

export default FileUpload;
