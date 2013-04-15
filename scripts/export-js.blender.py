import bpy
import sys

bpy.ops.export.threejs(filepath=sys.argv[-1], option_flip_yz=False)
