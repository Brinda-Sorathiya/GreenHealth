import React, { useState, useEffect } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const AnimatedBox = () => {
  const [data, setData] = useState("");
  const [cat, setCat] = useState(""); // Store selected category
  const [status, setStatus] = useState("nosuccess"); // Track success or nosuccess
  const [collectedData, setCollectedData] = useState([]); // Store data for graph
  const [isMeasuring, setIsMeasuring] = useState(false); // Track if measuring
  const [average, setAverage] = useState(null); // Store calculated average
  const [chart, setChart] = useState(null); // Chart instance
  
  const startMeasurement = () => {
    // Clear previous data and reset states
    if (chart) chart.destroy(); // Destroy any previous chart
    setCollectedData([]); 
    setIsMeasuring(true); 
    setAverage(null); 
  
    // Start data collection
    setTimeout(() => {
      setIsMeasuring(false); // Stop measuring after 5 seconds
      // Calculate the average and plot graph after data collection finishes
      setTimeout(() => {
        calculateAverage();
        plotGraph();
      }, 0); // Allow `collectedData` to update fully
    }, 5000);
  };

  const calculateAverage = () => {
    if (collectedData.length === 0) return; // Avoid dividing by 0
    const avg =
      collectedData.reduce((sum, item) => sum + item.value, 0) / collectedData.length;
    setAverage(avg);
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "data") {
        console.log("Data from server:", message.payload);
        setData(message.payload);
        setStatus("success"); // Set success state on valid data
        if (isMeasuring) {
          setCollectedData((prev) => [
            ...prev,
            { time: new Date().toLocaleTimeString(), value: parseFloat(message.payload) },
          ]);
        }
      } else if (message.type === "error") {
        console.error("Error from server:", message.payload);
        setStatus("nosuccess"); // Set nosuccess state on error
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => ws.close();
  }, [isMeasuring]);
  
  const plotGraph = () => {
    const ctx = document.getElementById("myChart").getContext("2d");
    if (chart) chart.destroy(); // Destroy previous chart instance
  
    const times = collectedData.map((item) => item.time);
    const values = collectedData.map((item) => item.value);
  
    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: times,
        datasets: [
          {
            label: "Live Data",
            data: values,
            borderColor: "white",
            borderWidth: 2,
            pointBackgroundColor: "green",
            fill: true,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "white",
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)",
            },
          },
          y: {
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)",
            },
          },
        },
        layout: {
          padding: 20,
        },
      },
    });
  
    setChart(newChart);
  };
  
  const reset = () => {
    setCollectedData([]);
    setAverage(null);
    setStatus("nosuccess");
    if (chart) chart.destroy();
    setChart(null);
  };
  
  const handleCategoryChange = (e) => {
    setCat(e.target.value); // Update cat state when category is selected
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen space-y-8">
      {/* Display live data or disconnected status */}
      <div className="text-2xl font-bold backdrop-blur-sm bg-black/60 p-5 rounded-md text-white">
        {status === "nosuccess" ? <span className="text-red-700">Disconnected</span> : `Live Data: ${data}`}
      </div>

      {/* Show Start Measurement button */}
      {!isMeasuring && average === null && (
        <button
          onClick={startMeasurement}
          className="shadow font-bold relative inline-flex items-center justify-center p-0.5 mb-2 md:mb-0 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 group-hover:from-teal-600 group-hover:to-green-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800"
        >
          <span className=" text-2xl relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">Start Measurement</span>
        </button>
      )}

      {/* Show measuring message */}
      {isMeasuring && <p className="text-xl text-slate-700">Measuring...</p>}

      {/* Display the average value and reset button */}
      {average !== null && (
        <div className="flex text-xl backdrop-blur-sm bg-black/70 p-[10px] rounded-md">
          <div className="flex flex-col">
            <p className="pr-[30px] text-white text-xl ">Average Value: {average.toFixed(2)}</p>
            <p className="pr-[30px] text-white text-xl font-bold ">
              {cat === "Cat1" && (
                average >= 150 ? (
                  average >= 195 ? (
                    <span className="text-yellow-500">Leaf is dry</span>
                  ) : (
                    <span className="text-red-600">Leaf is healthy</span>
                  )
                ) : (
                  <span className="text-green-600">Leaf is healthy</span>
                )
              )}

              {cat === "Cat2" && (
                average === 0 ? <span className="text-red-600">leaf is unhealthy</span> : <span className="text-green-600">leaf is healthy</span>
              )}
              {cat === "Cat3" && (
                average === 0 ? <span className="text-red-600">leaf is unhealthy</span> : <span className="text-green-600">leaf is healthy</span>
              )}
            </p>

          </div>

          <button
            onClick={reset}
            className="shadow font-bold relative inline-flex items-center justify-center p-0.5 mb-2 md:mb-0 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 group-hover:from-teal-600 group-hover:to-green-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800"
          >
            <span className=" relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">Back</span>
          </button>
        </div>
      )}

      {/* Display the chart */}
      <div className="w-3/4 max-w-4xl backdrop-blur-sm bg-black/60 mt-4 mx-[40px] p-[30px] rounded-md">
        <canvas id="myChart"></canvas>
      </div>

      {/* Category selection */}
      <form className="max-w-sm mx-auto">
        <select
          id="countries"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={handleCategoryChange} // Handle category change
        >
          <option value="">Choose a category</option>
          <option value="Cat1">Cat1</option>
          <option value="Cat2">Cat2</option>
          <option value="Cat3">Cat3</option>
        </select>
      </form>
    </div>
  );
};

export default AnimatedBox;
