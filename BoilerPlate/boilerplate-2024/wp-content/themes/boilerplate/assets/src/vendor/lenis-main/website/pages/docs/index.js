import { useFrame } from '@studio-freight/hamo'
import { useEffect, useRef, useState } from 'react'
import Lenis from '../../../dist/lenis.mjs'
import s from './docs.module.scss'

export default function Docs() {
  const [rootLenis, setRootLenis] = useState()
  const [lenis, setLenis] = useState()

  useEffect(() => {
    const lenis = new Lenis({})
    setRootLenis(lenis)

    return () => {
      setRootLenis(undefined)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    const lenis = new Lenis({
      wrapper: document.querySelector('#wrapper'),
      content: document.querySelector('#content'),
      // wheelEventsTarget: window,
      // autoResize: false,
    })
    setLenis(lenis)

    window.lenis = lenis

    return () => {
      setLenis(undefined)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    rootLenis?.on('scroll', (e) => {
      console.log(
        window.scrollY,
        e.scroll,
        Math.floor(e.scroll),
        e.actualScroll
      )
    })
  }, [rootLenis])

  useFrame((time) => {
    rootLenis?.raf(time)
    lenis?.raf(time)
  }, [])

  const contentRef = useRef()

  // const lorem = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure autem
  // accusantium similique quod accusamus ipsum saepe consequuntur,
  // delectus voluptatum quibusdam laboriosam labore eos ab necessitatibus,
  // sit hic ad dignissimos soluta. Lorem ipsum dolor sit amet consectetur
  // adipisicing elits`

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     contentRef.current.textContent = new Array(Math.ceil(Math.random() * 10))
  //       .fill(lorem)
  //       .join(' ')
  //   }, 2000)

  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [])

  return (
    <div className={s.page}>
      <div id="wrapper" className={s.wrapper}>
        <p id="content" className={s.content} ref={contentRef}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure autem
          accusantium similique quod accusamus ipsum saepe consequuntur,
          delectus voluptatum quibusdam laboriosam labore eos ab necessitatibus,
          sit hic ad dignissimos soluta. Lorem ipsum dolor sit amet consectetur
          adipisicing elit. Iure autem accusantium similique quod accusamus
          ipsum saepe consequuntur, delectus voluptatum quibusdam laboriosam
          labore eos ab necessitatibus, sit hic ad dignissimos soluta. Lorem
          ipsum dolor sit amet consectetur adipisicing elit. Iure autem
          accusantium similique quod accusamus ipsum saepe consequuntur,
          delectus voluptatum quibusdam laboriosam labore eos ab necessitatibus,
          sit hic ad dignissimos soluta. Lorem ipsum dolor sit amet consectetur
          adipisicing elit. Iure autem accusantium similique quod accusamus
          ipsum saepe consequuntur, delectus voluptatum quibusdam laboriosam
          labore eos ab necessitatibus, sit hic ad dignissimos soluta. Lorem
          ipsum dolor sit amet consectetur adipisicing elit. Iure autem
          accusantium similique quod accusamus ipsum saepe consequuntur,
          delectus voluptatum quibusdam laboriosam labore eos ab necessitatibus,
          sit hic ad dignissimos soluta. Lorem ipsum dolor sit amet consectetur
          adipisicing elit. Iure autem accusantium similique quod accusamus
          ipsum saepe consequuntur, delectus voluptatum quibusdam laboriosam
          labore eos ab necessitatibus, sit hic ad dignissimos soluta.
        </p>
      </div>
    </div>
  )
}
