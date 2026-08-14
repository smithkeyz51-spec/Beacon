import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Beacon crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          fontFamily: 'monospace',
          background: '#0B0F14',
          color: '#FF6B57',
          padding: 24,
          minHeight: '100vh',
          whiteSpace: 'pre-wrap'
        }}>
          Something went wrong:{'\n\n'}
          {this.state.error.message || String(this.state.error)}
        </div>
      )
    }
    return this.props.children
  }
}
