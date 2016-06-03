import sys
import bpy

bpy.ops.export_scene.obj(
    filepath=sys.argv[-1],
    axis_forward='Y',
    axis_up='Z',
    use_materials=False,
    use_triangles=True,
)

