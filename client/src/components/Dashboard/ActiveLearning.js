import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ActiveLearning.css';

const ActiveLearning = () => {
  const [threshold, setThreshold] = useState(0.75);
  const [maxIterations, setMaxIterations] = useState(3);
  const [resampling, setResampling] = useState('under_sampling');
  const [classifier, setClassifier] = useState('RF');
  const [samplingType, setSamplingType] = useState('leastConfidence');
  const [testSize, setTestSize] = useState(0.2);
  const [manualAnnotationsCount, setManualAnnotationsCount] = useState(12);
  const [comments, setComments] = useState('-RF_LC-12-12');
  const [fileContent, setFileContent] = useState(''); // new state to hold file content
  const [iterationIndex, setIterationIndex] = useState(1); // start at iteration 1
  const [displayContent, setDisplayContent] = useState(''); // content to display
  const handleSendToServer = async () => {
    const response = await axios.post('http://127.0.0.1:5000/activeLearning', {
      threshold: threshold,
      max_iterations: maxIterations,
      resampling: resampling,
      classifier: classifier,
      sampling_type: samplingType,
      test_size: testSize,
      manual_annotations_count: manualAnnotationsCount,
      comments: comments
    });
    setFileContent(response.data.fileContent); // save file content to state
    console.log(response.data.fileContent);  // logging the file content

    // set displayContent to first iteration
    const iterationContent = extractIteration(response.data.fileContent, 1);
    console.log(iterationContent);  // logging the iterationContent
    setDisplayContent(iterationContent);
    setIterationIndex(1);

  };

  const extractIteration = (fileContent, iteration) => {
    const lines = fileContent.split('\n');
    let count = 0;
    let index = -1;
  
    // Loop through the lines until we find the nth occurrence of 'Analysis DataFrame :'
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Analysis DataFrame :')) {
        count += 1;
        if (count === iteration) {
          index = i;
          break;
        }
      }
    }
  
    console.log(index);  // logging the found index
  
    // Return 27 lines above 'Analysis DataFrame :' up to 2 lines above it
    // Make sure the slice start isn't less than 0
    return lines.slice(Math.max(0, index - 27), index - 2).join('\n');
  };

  const handleIterationChange = (direction) => {
    // When "Next Iteration" or "Previous Iteration" button is clicked, update iteration index and displayContent
    let newIndex = iterationIndex;
    if (direction === 'next' && iterationIndex < maxIterations) {
      newIndex = iterationIndex + 1;
    } else if (direction === 'prev' && iterationIndex > 1) {
      newIndex = iterationIndex - 1;
    }

    const newIterationContent = extractIteration(fileContent, newIndex);
    setDisplayContent(newIterationContent);
    setIterationIndex(newIndex);
  };
  return (
    <form className="active-learning">
      <div className="input-container">
        <label className="input-label">
          Threshold: {threshold}
        </label>
        <input
          className="input-slider"
          type="range"
          min="0"
          max="1"
          step="0.01" // Changed from 0.1 to 0.01
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        />
      </div>

      <div className="input-container">
        <label className="input-label">
          Max Iterations:
        </label>
        <input
          className="input-number"
          type="number"
          value={maxIterations}
          onChange={(e) => setMaxIterations(e.target.value)}
        />
      </div>
      <div className="input-container">
        <label className="input-label">Resampling:</label>
        <input
          type="text"
          value={resampling}
          onChange={(e) => setResampling(e.target.value)}
        />
      </div>

      <div className="input-container">
        <label className="input-label">Classifier:</label>
        <input
          type="text"
          value={classifier}
          onChange={(e) => setClassifier(e.target.value)}
        />
      </div>

      <div className="input-container">
        <label className="input-label">Sampling Type:</label>
        <input
          type="text"
          value={samplingType}
          onChange={(e) => setSamplingType(e.target.value)}
        />
      </div>

      <div className="input-container">
        <label className="input-label">Test Size:</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="1"
          value={testSize}
          onChange={(e) => setTestSize(e.target.value)}
        />
      </div>

      <div className="input-container">
        <label className="input-label">Manual Annotations Count:</label>
        <input
          type="number"
          value={manualAnnotationsCount}
          onChange={(e) => setManualAnnotationsCount(e.target.value)}
        />
      </div>

      <div className="input-container">
        <label className="input-label">Comments:</label>
        <input
          type="text"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      <button type="button" onClick={handleSendToServer}>Submit</button>
      <div className="input-container">
        <label className="input-label">Current Iteration: {iterationIndex}</label>
        </div>
      <button type="button" onClick={() => handleIterationChange('prev')}>Previous Iteration</button>
      <button type="button" onClick={() => handleIterationChange('next')}>Next Iteration</button>
      <div className="file-content">
        <pre>{displayContent}</pre>
      </div>
    </form>
  );
};

export default ActiveLearning;
