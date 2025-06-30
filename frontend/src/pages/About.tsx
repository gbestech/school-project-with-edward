import React from 'react'
import AboutComponent from './../components/about/About'

const About = () => {
  return (
    <div>
        <AboutComponent />
        <div className="text-center text-gray-500 mt-4">
            <p>© 2023 Your Company Name. All rights reserved.</p>
        </div>
    </div>
  )
}

export default About