#!/usr/bin/env node

/**
 * Debug script to identify failing tests
 */

const { execSync } = require('child_process')

console.log('🔍 Running tests to identify failures...\n')

try {
  // Run jest and capture output
  const result = execSync('npx jest --no-coverage --silent=false 2>&1', {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20 // 20MB buffer
  })
  
  console.log(result)
} catch (error) {
  // Jest exit code 1 when tests fail, but we still want the output
  const output = error.stdout || error.stderr || error.output?.join('') || ''
  
  // Extract failed test information
  const lines = output.split('\n')
  const failedSuites = []
  const failedTests = []
  
  let currentSuite = ''
  let inFailureSection = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Detect failed test suites
    if (line.includes('FAIL ')) {
      const match = line.match(/FAIL (.+)\.test\.tsx?/)
      if (match) {
        currentSuite = match[1]
        failedSuites.push(currentSuite)
      }
    }
    
    // Detect individual failed tests
    if (line.includes('✕') || line.includes('× ')) {
      const testName = line.replace(/^\s*[✕×]\s*/, '').trim()
      if (testName) {
        failedTests.push({
          suite: currentSuite,
          test: testName
        })
      }
    }
  }
  
  console.log('❌ FAILING TEST SUITES:')
  console.log('=====================')
  failedSuites.forEach((suite, i) => {
    console.log(`${i + 1}. ${suite}`)
  })
  
  console.log('\n❌ FAILING TESTS:')
  console.log('================')
  failedTests.forEach((test, i) => {
    console.log(`${i + 1}. [${test.suite}] ${test.test}`)
  })
  
  // Also show the raw output for debugging
  console.log('\n📝 FULL OUTPUT:')
  console.log('==============')
  console.log(output)
  
  process.exit(1)
}