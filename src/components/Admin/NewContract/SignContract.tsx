import React from 'react'
import { Stage, Layer, Line } from 'react-konva'
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline'
const SignContract = () => {
  const [tool, setTool] = React.useState('pen')
  const [lines, setLines] = React.useState<any>([])
  const isDrawing = React.useRef(false)
  const stageRef = React.useRef<any>(null)
  const handleMouseDown = (e: any) => {
    isDrawing.current = true
    const pos = e.target.getStage().getPointerPosition()
    setLines([...lines, { tool, points: [pos.x, pos.y] }])
  }

  const handleMouseMove = (e: any) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return
    }
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    const lastLine = lines[lines.length - 1]
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y])

    // replace last
    lines.splice(lines.length - 1, 1, lastLine)
    setLines(lines.concat())
  }

  const handleMouseUp = () => {
    isDrawing.current = false
  }
  const handleExport = () => {
    const uri = stageRef.current.toDataURL()
  }
  return (
    <>
      {' '}
      <div className='shadow-lg' style={{ width: 300, border: '1px solid black', margin: 1 }}>
        <div>
          <Stage
            width={300}
            height={300}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <Layer
              style={{
                backgroundColor: 'white'
              }}
            >
              {lines.map((line: any, i: number) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke='black'
                  strokeWidth={5}
                  tension={0.5}
                  lineCap='round'
                  lineJoin='round'
                  globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
      <div className='w-full flex justify-between'>
        <button
          type='button'
          className='middle my-3 none center mr-4 rounded-md bg-[#0070f4] py-2 px-4 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-[#0072f491] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'
          data-ripple-light='true'
          onClick={() => setLines([])}
        >
          Thử lại
        </button>
        <button
          type='button'
          className='middle my-3 none center mr-4 rounded-md bg-[#0070f4] py-2 px-4 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-[#0072f491] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'
          data-ripple-light='true'
          onClick={handleExport}
        >
          Xác nhận
        </button>
      </div>
    </>
  )
}
export default SignContract
