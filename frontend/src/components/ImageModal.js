import { HiX } from "react-icons/hi";
import { useState } from 'react';

function ImageModal({ image, description, onClose, onDelete, checkPassword }) {
    const [enteredPassword, setEnteredPassword] = useState('');
    const [passwordValid, setPasswordValid] = useState(true);

    const handleDelete = async (postID, password) => {
        const isValid = await checkPassword(postID, password);
        setPasswordValid(isValid);
      
        if (isValid) {
          onDelete(postID, password);
          onClose();
        }
      };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50"
        onClick={handleOverlayClick}>
        <div className="bg-white p-4 rounded-lg shadow-lg">
                <button className="absolute top-2 right-2" onClick={onClose}>
                    <HiX className="h-6 w-6 text-gray-700" />
                </button>

                <img className="w-full h-auto mb-4" src={image} alt="Selected" />
                <p className="text-gray-700 mb-4">{description}</p>
                <input
                type="password"
                placeholder="Enter password"
                className="w-full px-3 py-2 mt-4 border border-gray-300 rounded-md"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                autoComplete="off"
                
            />
                <button
                className={`mt-4 px-4 py-2 bg-red-600 text-white rounded-md ${
                    !passwordValid ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => handleDelete(image.split("/").slice(-1)[0], enteredPassword)}
                >
                Delete
                </button>
                            {!passwordValid && (
                <p className="text-red-600 mt-2">Incorrect password. Please try again.</p>
            )}
            </div>
        </div>
    );
}

export default ImageModal;