// death-and-taxes/src/pages/components/PoweredByPi.jsx

import React from 'react'
import PiBadge from './PiBadge.jsx'

export default function PoweredByPi() {
  return (
    <div className="powered-by-pi">
      <PiBadge />
      <span className="powered-text">
        Powered by <strong>Pi</strong> — trust-first, audit-grade, and glowing by design.
      </span>
    </div>
  )
}