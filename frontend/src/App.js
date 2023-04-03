import { useState, useEffect } from 'react'
import UploadBar from './components/UploadBar'
import ImageGallery from './components/ImageGallery'
import ImageModal from "./components/ImageModal";
import { v4 as uuidv4 } from 'uuid';

function App() {
    const IP = "localhost"
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedDescription, setSelectedDescription] = useState(null);
    const [selectedImgLink, setSelectedImageLink] = useState(null);
    const [images, setImages] = useState([])
    
    useEffect(() => {
        // console.log(fetch(`http://${IP}:3001/posts/`))
        fetch(`https://${IP}:3001/posts/`)
        .then(response => response.json())
        .then(data => {
            setImages(data.Items.map(item => item))})
    }, [])

    const handleLike = async (postID, increment = false) => {
        let newPut;
        if (increment) {newPut = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                }
            }
        }
        else {newPut = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                }
            }
        }
        const response = await fetch(`https://${IP}:3001/posts/${postID}/`, newPut)
        const data = await response.json();
        // console.log(data)
        return data.like_count;
    };

    const handleImageClick = (postID, description, img_path) => {
        setSelectedImage(postID);
        setSelectedDescription(description);
        setSelectedImageLink(img_path)
    };
    const handleSubmit = async (image1, description, password) => {
        const imagePath = await postImage(image1);
        const randomID = uuidv4(); // Generate a random ID
        const newImage = {
            postID: randomID,
            description: description,
            img_path: imagePath,
            password: password,
            like_count: 0
        };
        setImages([...images, newImage]);
        await postToDB(randomID, imagePath, description, password);
    };

    const handleDelete = async (postID, enteredPassword) => {
        const isValid = await checkPassword(postID, enteredPassword);
        if (isValid) {
            deleteFromDB(postID, enteredPassword);
            setImages(images.filter(image => image.postID !== postID));
        }
    };

    const checkPassword = async (postID, enteredPassword) => {
        const response = await fetch(`https://${IP}:3001/posts/${postID}`);
        const data = await response.json();
        const verified = await fetch(`https://${IP}:3001/verify/${enteredPassword}`);
        const result = await verified.json()
        return (data.password === enteredPassword || result.verified);
    };

    const postImage = async (image2) => {
        const formData = new FormData();
        formData.append('image', image2);
        const requestOptions = {
            method: 'POST',
            body: formData
        };
        const response = await fetch(`https://${IP}:3001/images`, requestOptions);
        const data = await response.json();
        // await postToDB(data.imagePath);
        return data.imagePath;
    };
    
    const postToDB = async (randomID, imageLink, description, password) => {
        const newPost = {
            postID: randomID,
            description: description,
            img_path: imageLink,
            password: password,
            like_count: 0
        };

        const formParams = new URLSearchParams();
        for (const key in newPost) {
            formParams.append(key, newPost[key]);
        }
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: formParams.toString()
        }
        const response = await fetch(`https://${IP}:3001/posts/`, requestOptions);
        const data = await response.json();
        return data;
    };

    const deleteFromDB = async (postID, password) => {
        const requestOptions = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
        };
        const response = await fetch(`https://${IP}:3001/posts/${postID}?password=${password}`, requestOptions);
        // console.log('Delete response:', response);
      };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-indigo-100 h-screen">
            <UploadBar onSubmit={handleSubmit} />
            {selectedImage && (
                <ImageModal
                    imageID={selectedImage}
                    description={selectedDescription}
                    img_path={selectedImgLink}
                    checkPassword={checkPassword}
                    onClose={() => setSelectedImage(null)}
                    onDelete={handleDelete}
                    onLike={handleLike}
                />
)}
            <div className="flex flex-wrap">
                <ImageGallery images={images} onDelete={handleDelete} onClick={handleImageClick} />
            </div>
        </div>
    )
}

export default App
