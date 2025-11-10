/**
 * @file city-search.tsx
 * @description 도시 자동완성 검색 컴포넌트
 *
 * 사용자가 도시명을 입력하면 자동완성 검색 결과를 표시하고,
 * 선택한 도시의 좌표 정보를 반환합니다.
 */

"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { searchCities, type CityInfo, getDefaultCity } from "@/lib/bazi/city-coordinates";

interface CitySearchProps {
  value?: string;
  onSelect: (city: CityInfo) => void;
  placeholder?: string;
  className?: string;
}

export function CitySearch({
  value,
  onSelect,
  placeholder = "시군구 단위로 검색",
  className,
}: CitySearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState(value || "");
  const [selectedCity, setSelectedCity] = React.useState<CityInfo | null>(
    value ? searchCities(value)[0] || null : null
  );

  const cities = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return [getDefaultCity()]; // 기본값으로 서울 표시
    }
    return searchCities(searchQuery);
  }, [searchQuery]);

  const handleSelect = (city: CityInfo) => {
    setSelectedCity(city);
    setSearchQuery(city.name);
    setOpen(false);
    onSelect(city);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="도시명을 검색하세요..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.name}
                    value={city.name}
                    onSelect={() => handleSelect(city)}
                  >
                    {city.fullName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-sm text-muted-foreground">
        태어난 도시를 모르시는 경우 &apos;서울특별시&apos; 혹은 태어난 국가의 수도를 입력해주세요
      </p>
    </div>
  );
}

