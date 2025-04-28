import { useState } from 'react'
import TextDiffComparer from './components/TextDiffComparer'
import './App.css'

function App() {
  return (
    <div className="app">
      <header>
        <h1>文本对比工具</h1>
        <p>比较两段文本，查看它们的差异</p>
      </header>
      
      <main>
        <TextDiffComparer />
      </main>
      
      <footer>
        <p>纯前端文本对比工具 - 基于React和Diff库</p>
      </footer>
    </div>
  )
}

export default App