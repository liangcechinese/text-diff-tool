import { useState, useEffect } from 'react'
import * as Diff from 'diff'
import './TextDiffComparer.css'

function TextDiffComparer() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [diffResult, setDiffResult] = useState([])
  const [viewMode, setViewMode] = useState('inline') // 'inline' or 'side-by-side'
  const [options, setOptions] = useState({
    ignoreCase: false,
    ignoreWhitespace: false
  })

  // 执行文本比较
  const compareTexts = () => {
    let left = leftText
    let right = rightText
    
    if (options.ignoreCase) {
      left = left.toLowerCase()
      right = right.toLowerCase()
    }
    
    if (options.ignoreWhitespace) {
      left = left.replace(/\s+/g, ' ').trim()
      right = right.replace(/\s+/g, ' ').trim()
    }
    
    // 使用字符级对比而不是单词级，以捕获更精细的差异
    const diff = Diff.diffChars(left, right)
    setDiffResult(diff)
  }

  // 当文本或选项变化时重新比较
  useEffect(() => {
    compareTexts()
  }, [leftText, rightText, options.ignoreCase, options.ignoreWhitespace])

  // 处理选项变更
  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  // 渲染内联视图的差异
  const renderInlineDiff = () => {
    // 分析差异结果，合并相邻的相同部分，以保持上下文
    const processedDiff = [];
    let currentContext = '';
    
    // 处理每个差异部分
    diffResult.forEach((part) => {
      if (!part.added && !part.removed) {
        // 对于相同部分，累积到上下文中
        currentContext += part.value;
      } else {
        // 当遇到差异时，先添加上下文（如果有）
        if (currentContext) {
          processedDiff.push({
            value: currentContext,
            context: true
          });
          currentContext = '';
        }
        // 添加差异部分
        processedDiff.push(part);
      }
    });
    
    // 添加最后的上下文（如果有）
    if (currentContext) {
      processedDiff.push({
        value: currentContext,
        context: true
      });
    }
    
    return (
      <div className="diff-result inline-diff">
        {processedDiff.map((part, index) => {
          if (part.context) {
            // 为上下文部分添加分隔符，保持可读性
            return (
              <span key={index} className="unchanged context">
                {part.value}
              </span>
            );
          } else {
            return (
              <span 
                key={index}
                className={part.added ? 'added' : part.removed ? 'removed' : 'unchanged'}
              >
                {part.value}
              </span>
            );
          }
        })}
      </div>
    );
  };

  // 渲染并排视图的差异
  const renderSideBySideDiff = () => {
    // 分离左右文本的差异部分，增强显示效果
    const leftParts = [];
    const rightParts = [];
    
    // 为保持两侧对齐，需要同时处理两边的文本
    diffResult.forEach(part => {
      if (part.added) {
        // 添加到右侧，左侧添加空白占位
        rightParts.push({...part, highlight: true});
      } else if (part.removed) {
        // 添加到左侧，右侧不添加
        leftParts.push({...part, highlight: true});
      } else {
        // 相同部分，两侧都添加
        leftParts.push({...part, highlight: false});
        rightParts.push({...part, highlight: false});
      }
    });
    
    return (
      <div className="side-by-side-container">
        <div className="diff-side left-side">
          {leftParts.map((part, index) => (
            <span 
              key={index}
              className={part.highlight ? 'removed' : 'unchanged'}
            >
              {part.value}
            </span>
          ))}
        </div>
        <div className="diff-side right-side">
          {rightParts.map((part, index) => (
            <span 
              key={index}
              className={part.highlight ? 'added' : 'unchanged'}
            >
              {part.value}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="text-diff-comparer">
      <div className="options-bar">
        <div className="view-mode-selector">
          <button 
            className={viewMode === 'inline' ? 'active' : ''}
            onClick={() => setViewMode('inline')}
          >
            内联视图
          </button>
          <button 
            className={viewMode === 'side-by-side' ? 'active' : ''}
            onClick={() => setViewMode('side-by-side')}
          >
            并排视图
          </button>
        </div>
        <div className="comparison-options">
          <label>
            <input 
              type="checkbox" 
              checked={options.ignoreCase}
              onChange={() => handleOptionChange('ignoreCase')}
            />
            忽略大小写
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={options.ignoreWhitespace}
              onChange={() => handleOptionChange('ignoreWhitespace')}
            />
            忽略空格
          </label>
        </div>
      </div>
      
      <div className="text-inputs">
        <div className="text-input-container">
          <h3>原文本</h3>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="请输入原始文本..."
          />
        </div>
        <div className="text-input-container">
          <h3>比较文本</h3>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="请输入需要比较的文本..."
          />
        </div>
      </div>
      
      <div className="diff-container">
        <h3>差异结果</h3>
        {diffResult.length > 0 ? (
          viewMode === 'inline' ? renderInlineDiff() : renderSideBySideDiff()
        ) : (
          <div className="no-diff-message">请在两侧输入要比较的文本</div>
        )}
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <span className="legend-color added"></span>
          <span>添加的内容</span>
        </div>
        <div className="legend-item">
          <span className="legend-color removed"></span>
          <span>删除的内容</span>
        </div>
        <div className="legend-item">
          <span className="legend-color unchanged"></span>
          <span>相同的内容</span>
        </div>
      </div>
    </div>
  )
}

export default TextDiffComparer