import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function AuthGate({ onAuthenticated }) {
    const videoRef = useRef(null);
    const [status, setStatus] = useState("Loading AI models...");
    const [modelsLoaded, setModelsLoaded] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            // Loads face detection models from public folder or CDN
            const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            setModelsLoaded(true);
            setStatus("Models loaded. Starting video...");
            startVideo();
        };
        loadModels();
    }, []);

    const startVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: {} })
            .then((stream) => {
                if (videoRef.current) videoRef.current.srcObject = stream;
                setStatus("Position your face in front of the camera...");
            })
            .catch((err) => setStatus("Camera access denied."));
    };

    const verifyFace = async () => {
        if (!videoRef.current || !modelsLoaded) return;
        setStatus("Scanning face...");

        const detection = await faceapi
            .detectSingleFace(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            setStatus("No face detected. Try again.");
            return;
        }

        // Retrieve your saved descriptor from localStorage (enrolled beforehand)
        const savedDescriptor = localStorage.getItem("jv_face_descriptor");

        if (!savedDescriptor) {
            // Enroll yourself on first scan
            const descriptorArray = Array.from(detection.descriptor);
            localStorage.setItem("jv_face_descriptor", JSON.stringify(descriptorArray));
            setStatus("Face enrolled! Access granted.");
            setTimeout(() => onAuthenticated(), 1000);
            return;
        }

        // Compare detected face descriptor against saved descriptor
        const referenceDescriptor = new Float32Array(JSON.parse(savedDescriptor));
        const distance = faceapi.euclideanDistance(detection.descriptor, referenceDescriptor);

        // Distance threshold: lower means stricter matching
        if (distance < 0.5) {
            setStatus("Identity verified. Welcome back.");
            setTimeout(() => onAuthenticated(), 800);
        } else {
            setStatus("Access Denied: Face match failed.");
        }
    };

    return (
        <div style={gateStyles.container}>
            <h2 style={gateStyles.title}>SECURITY CHECK</h2>
            <p style={gateStyles.status}>{status}</p>

            <div style={gateStyles.videoWrapper}>
                <video ref={videoRef} autoPlay muted style={gateStyles.video} />
            </div>

            <button style={gateStyles.btn} onClick={verifyFace} disabled={!modelsLoaded}>
                AUTHENTICATE
            </button>
        </div>
    );
}

const gateStyles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#080B10",
        color: "#4FD8E8",
        fontFamily: "'JetBrains Mono', monospace",
    },
    title: { letterSpacing: "4px", marginBottom: "10px" },
    status: { color: "#8FC7FF", marginBottom: "20px" },
    videoWrapper: {
        width: "320px",
        height: "240px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "2px solid #4FD8E8",
        boxShadow: "0 0 20px rgba(79,216,232,0.4)",
        marginBottom: "20px",
    },
    video: { width: "100%", height: "100%", objectFit: "cover" },
    btn: {
        padding: "12px 28px",
        background: "transparent",
        border: "1.5px solid #4FD8E8",
        color: "#4FD8E8",
        fontFamily: "inherit",
        fontWeight: 700,
        letterSpacing: "2px",
        cursor: "pointer",
        borderRadius: "8px",
    },
};