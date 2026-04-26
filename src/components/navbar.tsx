import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent
} from "@/components/ui/navigation-menu"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { CircleQuestionMark } from 'lucide-react';

export function Navbar() {
  return (
    <NavigationMenu className='lg:px-10 lg:py-8 lg:rounded-none text-white max-w-full w-full h-16 fixed top-0 left-0 z-50 p-5 bg-mist-950/50'>
      <div className="flex items-center justify-between w-full">
        <Logo />
        
        {/* SMALL MENU */}
        <NavigationMenuList className="flex items-center justify-between lg:hidden">
          <NavigationMenuItem>
            <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
              <NavigationMenuContent className="rounded-b-none">
                <ul className="w-80 max-w-full">
                  <li>
                    Invoices
                  </li>
                  <li>
                    Clients
                  </li>
                </ul>
              </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>

        {/* LARGE MENU */}
        <div className="absolute top-0 left-0 hidden lg:block lg:relative"><Lgmenu/></div>

      </div>
    </NavigationMenu>
  )
}

function Logo() {
  return (
    <a href='/'><div><img src="/logo.png" alt="logo" width={40} className="rounded-md"/></div></a>
  )
}

function Lgmenu() {
  return (

    <TooltipProvider>
    <Tooltip>
  <TooltipTrigger><CircleQuestionMark /></TooltipTrigger>
  <TooltipContent>
    <p>Create your invoices, manage your clients and unpaid payments. This is V0 of this app, please stay updated with me "x.com/@sayandweep" for more updates.</p>
  </TooltipContent>
  </Tooltip>
  </TooltipProvider>
  )
}