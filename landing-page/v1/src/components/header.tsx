import { Button } from "./button"
import { Logo } from "./logo"

export const Header: React.FC = ()=> {
  return <>
  <header className="flex justify-between items-center z-9 bg-primary-50 top-[25px]" style={{backgroundImage:"url(/icons/cross-stroke-bg.svg)", backgroundRepeat: "no-repeat", backgroundSize: "contain 100%", backgroundPosition: "10%, -10%"}}>
    <div className="logo-div">
      <Logo className="w-[1.8rem] h-[1.8rem]" variant="secondary"/>
    </div>
    <ul className="flex-1 flex gap-[10%] text-lg">
      <li>Docs</li>
      <li>Faq</li>
      <li>Community</li>
      <li>Demo</li>
    </ul>
    <Button text="Github" variant="primary" />
  </header>
  
  </>
}