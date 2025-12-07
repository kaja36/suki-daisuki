import React from 'react'
import { useNavigate } from 'react-router-dom'

function Demo() {
    const navigate = useNavigate();

    return (
        <div>
            <button onClick={() => navigate('/demo/faceDemo')}>Face Demo</button> <br/>
            <button onClick={() => navigate('/demo/throwDemo')}>Throw Demo</button> <br/> 
            <button onClick={() => navigate('/demo/segmentDemo')}>Segment Demo</button> <br/>
        </div>
    )
}

export default Demo