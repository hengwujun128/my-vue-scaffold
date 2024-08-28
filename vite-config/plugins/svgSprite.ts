/**
 *  Vite Plugin for fast creating SVG sprites.
 * https://github.com/anncwb/vite-plugin-svg-icons
 */

import { resolve } from 'node:path'

import type { PluginOption } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import Icons from 'unplugin-icons/vite'

export function configSvgIconsPlugin({ isBuild }: { isBuild: boolean }) {
  const svgIconsPlugin = createSvgIconsPlugin({
    iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
    svgoOptions: isBuild, // svg compression configuration, can be an objectOptions
  })
  return svgIconsPlugin as PluginOption
}

export function createSvgIconsByUnplugin() {
  return Icons({ autoInstall: true })
}
