import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { useNavigate } from "react-router-dom";

export function Navbar() {
  return (
    <NavigationMenu className='lg:px-10 lg:py-8 lg:rounded-none text-white max-w-full w-full h-16 fixed top-0 left-0 z-50 p-6 bg-mist-950'>
      <div className="flex items-center justify-between w-full">
        <Logo />
        <NavigationMenuList className="flex items-center justify-between">
          <NavigationMenuItem>
            <NavigationMenuTrigger>Create</NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  )
}

function Logo() {
  return (
    <div onClick={navHome}><img src="/logo.png" alt="logo" width={40} className="rounded-md"/></div>
  )
}


function navHome() {
  const navigate = useNavigate();
  navigate(`/`);
}