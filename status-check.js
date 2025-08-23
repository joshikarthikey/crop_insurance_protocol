#!/usr/bin/env node

const http = require('http');

console.log('🔍 Checking Crop Insurance Protocol Services...\n');

// Check frontend
const checkFrontend = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend: Running on http://localhost:3000');
        resolve(true);
      } else {
        console.log('❌ Frontend: Error - Status', res.statusCode);
        resolve(false);
      }
    }).on('error', () => {
      console.log('❌ Frontend: Not running');
      resolve(false);
    });
  });
};

// Check weather service
const checkWeatherService = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/api/health', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Weather Service: Running on http://localhost:3001');
        resolve(true);
      } else {
        console.log('❌ Weather Service: Error - Status', res.statusCode);
        resolve(false);
      }
    }).on('error', () => {
      console.log('❌ Weather Service: Not running');
      resolve(false);
    });
  });
};

// Check weather API
const checkWeatherAPI = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/api/weather/current?lat=40.7128&lon=-74.0060', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Weather API: Responding correctly');
        resolve(true);
      } else {
        console.log('❌ Weather API: Error - Status', res.statusCode);
        resolve(false);
      }
    }).on('error', () => {
      console.log('❌ Weather API: Not responding');
      resolve(false);
    });
  });
};

// Main check function
const runChecks = async () => {
  const frontendOk = await checkFrontend();
  const weatherServiceOk = await checkWeatherService();
  const weatherApiOk = await checkWeatherAPI();
  
  console.log('\n📊 Summary:');
  console.log(`Frontend: ${frontendOk ? '✅' : '❌'}`);
  console.log(`Weather Service: ${weatherServiceOk ? '✅' : '❌'}`);
  console.log(`Weather API: ${weatherApiOk ? '✅' : '❌'}`);
  
  if (frontendOk && weatherServiceOk && weatherApiOk) {
    console.log('\n🎉 All services are running!');
    console.log('🌐 Open http://localhost:3000 to use the app');
    console.log('🔗 Connect your Leather wallet to start testing');
  } else {
    console.log('\n⚠️  Some services are not running');
    console.log('💡 Check the logs and restart services if needed');
  }
};

runChecks();
