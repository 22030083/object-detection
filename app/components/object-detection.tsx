"use client";
import React from 'react'
import Webcam from 'react-webcam'
import { useRef } from 'react';
import { useEffect } from 'react';
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import { useState } from 'react';
import * as tf from '@tensorflow/tfjs';  // Already imported in your code
import '@tensorflow/tfjs-backend-webgl';  // Make sure WebGL is available
import { renderPredictions } from './utils/render-predictions';



let detectInterval;
const ObjectDetection = () => {

  const [isLoading, setIsLoading] = useState(true);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  async function runCoco() {
    await tf.setBackend('webgl');  // Set WebGL as the backend
    await tf.ready();  // Ensure the backend is ready
    
    setIsLoading(true);
    const net = await cocoSSDLoad();  // Load the COCO-SSD model
    setIsLoading(false);
  
    detectInterval = setInterval(() => {
      runObjectDetection(net);  // Call the object detection function
    }, 10);
  }
  
  async function runObjectDetection(net) {
    if (
      canvasRef.current &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      // find detected objects
      const detectedObjects = await net.detect(
        webcamRef.current.video,
        undefined,
        0.6
      );
      const context = canvasRef.current.getContext("2d");
      renderPredictions(detectedObjects, context);


    }
  }


  const showmyVideo = () => {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const myVideoWidth = webcamRef.current.video.videoWidth;
      const myVideoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = myVideoWidth;
      webcamRef.current.video.height = myVideoHeight;
    }
  };
  useEffect(() => {
    runCoco();
    showmyVideo();
  }, [])
  return (
    <div className='mt-8'> {isLoading ? (
      <div className="gradient-text">Loading AI Model...</div>
    ) : 
      <div className='relative flex justify-center items-center gradient p-1.5 rounded-md'>
        {/* webcam */}
        <Webcam ref={webcamRef} className='rounded-md w-full lg:h-[720px]'  muted/>
        {/* canva */}
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 z-99999 w-full lg:h-[720px]"
          />
      </div>}
    </div>
  )
}

export default ObjectDetection
