import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function Navbar() {
  return (
    <NavigationMenu className='lg:px-20 lg:py-5 lg:rounded-none text-white max-w-full w-full h-16 fixed top-0 left-0 z-50 p-6 '>
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
    <div className="text-2xl font-bold">Invoice Flow</div>
  )
}