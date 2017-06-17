var test_cases = {
empty: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     64 64
BACK    0    0    0
AMBIENT 0.75 0.75 0.75
`,

test_outline: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     64 64
SPHERE  0  0 -10   3 3 1   0.5 0 0   1 0 0 50 0 0 0.8
SPHERE  5  5 -10   3 3 1   0.5 0 0   1 0 0 50 0 0 0.8
SPHERE  5 -5 -10   3 3 1   0.5 0 0   1 0 0 50 0 0 0.8
SPHERE -5  5 -10   3 3 1   0.5 0 0   1 0 0 50 0 0 0.8
SPHERE -5 -5 -10   3 3 1   0.5 0 0   1 0 0 50 0 0 0.8
LIGHT 0 0 0   0.3 0.3 0.3
BACK    0   0   1
AMBIENT 0.5 0.5 0.5
`,

test_facing_wrong: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     64 64
SPHERE  0 0 10 2 4 2 0.5 0 0 1 0 0 50 0 0 0.8
SPHERE  4 4 10 1 2 1 0 0.5 0 1 0 0 50 0 0 0.8
SPHERE -4 2 10 1 2 1 0 0 0.5 1 0 0 50 0 0 0.8
LIGHT  0  0   0    0.3 0.3 0.3
LIGHT  10 10 -10   0.9 0.9 0
LIGHT -10 5  -5    0   0   0.9
BACK    0.4  0.2  0.1
AMBIENT 0.75 0.75 0.75
`,

test_ambient: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     64 64
SPHERE  0 0 -10   2 4 2   0.5 0   0     1 0 0 50 0 0 0.8
SPHERE  4 4 -10   1 2 1   0   0.5 0     1 0 0 50 0 0 0.8
SPHERE -4 2 -10   1 2 1   0   0   0.5   1 0 0 50 0 0 0.8
LIGHT  0  0   0    0.3 0.3 0.3
LIGHT  10 10 -10   0.9 0.9 0
LIGHT -10 5  -5    0   0   0.9
BACK    0.5  0.5  0.5
AMBIENT 0.75 0.75 0.75
`,

test_overlap: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  4 1 -10   2 2 1   0.5 0   0     1 0 0 50 0 0 0.8
SPHERE  0 0 -10   4 4 1   0   0.5 0     1 0 0 50 0 0 0.8
SPHERE -4 1 -10   2 2 1   0.5 0   0.5   1 0 0 50 0 0 0.8
SPHERE  0 4 -10   3 3 1   0   0   0.5   1 0 0 50 0 0 0.8
LIGHT  0  -5  0    0.9 0   0
LIGHT  10  5  0    0   0.9 0
BACK    1    1    1
AMBIENT 0.85 0.85 0.85
`,

test_diffuse: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  0 0 -10   2 2 1   0.5 0   0     0 1 0 50 0 0 0.8
SPHERE  4 4 -10   2 2 1   0   0.5 0     0 1 0 50 0 0 0.8
SPHERE -4 2 -10   2 2 1   0   0   0.5   0 1 0 50 0 0 0.8
LIGHT  0  -5  0    0.9 0   0
LIGHT  10  5  0    0   0.9 0
LIGHT -10  5  0    0   0   0.9
BACK    0.5  0.5  0.5
AMBIENT 0.75 0.75 0.75
`,

test_specular: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  4 4 -10   2 2 1   0.5 0   0     0 0 1 100  0 0 0.8
SPHERE  0 0 -10   2 2 1   0   0.5 0     0 0 1 10   0 0 0.8
SPHERE -4 2 -10   2 2 1   0   0   0.5   0 0 1 1000 0 0 0.8
LIGHT  0  -5  0    0.9 0   0
LIGHT  10  5  0    0   0.9 0
LIGHT -10  5  0    0   0   0.9
BACK    1    1    1
AMBIENT 0.75 0.75 0.75
`,

test_oblong: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  4 4  -10   10 2  2   0.5 0   0     0 1 1 100  0 0 0.8
SPHERE -4 0  -6    2  10 2   0   0.5 0     0 1 1 10   0 0 0.8
SPHERE  4 0  -12   2  10 2   1   1   0     0 1 1 10   0 0 0.8
SPHERE  0 -4 -8    5  2  1   0   0   0.5   0 1 1 1000 0 0 0.8
LIGHT  0  -5  0    0.9 0   0
LIGHT  10  5  0    0   0.9 0
LIGHT -10  5  0    0   0   0.9
BACK    1    1    1
AMBIENT 0.75 0.75 0.75
`,
test_interior_light: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES 64 64
SPHERE 0 0   -1.5    2   2   2     0.8 0.5 0.5   0.5 1 0.9 50 0.5 0.5 0.7
LIGHT  0 1.5 -1.5    0.9 0.9 0.9
`,

test_trapped_light: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  0 0 -10   2    4    2     0.5 0   0     1 1 0.9 50 0 0 0.8
SPHERE  4 4 -10   1    2    1     0   0.5 0     1 1 0.9 50 0 0 0.8
SPHERE -4 2 -10   1    2    1     0   0   0.5   1 1 0.9 50 0 0 0.8
SPHERE  1 1 -1    0.25 0.25 0.5   0   0   0.5   1 1 1   50 0 0 0.8
LIGHT  1  1  -1    0.9 0.9 0.9
LIGHT  10 10 -10   0.3 0.3 0
LIGHT -10 5  -5    0   0   0.3
BACK    1   1   1
AMBIENT 0.2 0.2 0.2
`,

test_shadow: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  3  3 -8    1 1 1   0.5 0   0     0 1 0.9 50 0 0 0.8
SPHERE  0  0 -10   2 2 1   0   0.5 0     0 1 0.9 50 0 0 0.8
SPHERE -4 -4 -12   2 2 1   0   0   0.5   0 1 0.9 50 0 0 0.8
LIGHT 0 0  0    0.7 0.7 0.7
LIGHT 5 5 -5    1   1   1
BACK    1    1    1
AMBIENT 0.75 0.75 0.75
`,

test_reflection_fast: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     64 64
SPHERE  0 0 -10   2 4 2   0.5 0   0     0.5 1 0.9 50 1 0 0.8
SPHERE  4 4 -10   1 2 1   0   0.5 0     0.5 1 0.9 50 1 0 0.8
SPHERE -4 2 -10   1 2 1   0   0   0.5   0.5 1 0.9 50 1 0 0.8
LIGHT  0  0   0    0.9 0.9 0.9
LIGHT  10 10 -10   0.9 0.9 0
LIGHT -10 5  -5    0   0   0.9
BACK    0.1 0.2 0.4
AMBIENT 0.5 0.5 0.5
`,

test_reflection: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     256 256
SPHERE  0 0 -10   2 4 2   0.5 0   0     0.5 1 0.9 50 1 0 0.8
SPHERE  4 4 -10   1 2 1   0   0.5 0     0.5 1 0.9 50 1 0 0.8
SPHERE -4 2 -10   1 2 1   0   0   0.5   0.5 1 0.9 50 1 0 0.8
LIGHT  0  0   0    0.9 0.9 0.9
LIGHT  10 10 -10   0.9 0.9 0
LIGHT -10 5  -5    0   0   0.9
BACK    0.1 0.2 0.4
AMBIENT 0.5 0.5 0.5
`,

test_reflection_and_shadow: `
NEAR    0.75
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     256 256
SPHERE  2  0 -5   3   4 2     1 0   0     0.5 1 0.9 50 0.7 0 0.8
SPHERE -2  2 -5   1.5 3 1.5   0 0   0.5   0.5 1 0.9 50 0.7 0 0.8
SPHERE -2 -4 -5   1.5 3 1.5   1 0.5 0     0.5 1 0.9 50 0.7 0 0.8
LIGHT  30  90 -5   1 1 0
LIGHT -20 -10 -5   1 1 1
BACK    0.1 0.1 0.1
AMBIENT 0.5 0.5 0.5
`,

sky_sphere: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -2
TOP     2
RES     256 256
SPHERE  0 0 -10   2  4 2    0.7 0   0.3   0.2 1 0.9 50 0.75 0 0.8
SPHERE  0 4 -5    14 8 14   0.3 0   0     0.2 1 0.9 50 0.75 0 0.8
SPHERE -4 2 -10   1  2 1    0   0   0.7   0.2 1 0.9 50 0.75 0 0.8
SPHERE  2 2 -5    1  2 2    0   0.7 0.7   0.2 1 0.9 50 0.75 0 0.8
LIGHT  0   1.5  0     0.9 0.9 0.9
LIGHT  3.5 4.2 -5     0.9 0.9 0
LIGHT -5   2.5 -2.5   0   0   0.9
`,

test_refract: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     256 256
SPHERE 1  0 -8    2 4 2   0.5 0   0     0.5 1 0.9 50 0 1 0.8
SPHERE 1 -2 -4    1 2 1   0   0.5 0     0.5 1 0.9 50 0 1 0.8
SPHERE 1  2 -12   1 2 1   0   0   0.5   0.5 1 0.9 50 0 1 0.8
LIGHT  0  0   0    0.9 0.9 0.9
LIGHT  10 10 -10   0.9 0.9 0
LIGHT -10 5  -5    0   0   0.9
BACK    0.1 0.2 0.4
AMBIENT 0.5 0.5 0.5
`,

test_transparent: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     256 256
SPHERE  0  1 -4   1 1 1   0.5 0   0     0 1 1 500  0.3 1 0.8
SPHERE  0  1 -6   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  0 -1 -4   1 1 1   0   0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  0 -1 -6   1 1 1   0   0   0.5   0 1 1 500  0.3 1 0.8
SPHERE -2  1 -4   1 1 1   0.5 0   0     0 1 1 500  0.3 1 0.8
SPHERE -2  1 -6   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE -2 -1 -4   1 1 1   0   0.5 0     0 1 1 500  0.3 1 0.8
SPHERE -2 -1 -6   1 1 1   0   0   0.5   0 1 1 500  0.3 1 0.8
SPHERE  2  1 -4   1 1 1   0.5 0   0     0 1 1 500  0.3 1 0.8
SPHERE  2  1 -2   1 1 1   0.5 0   0     0 1 1 500  0.3 1 0.8
SPHERE  2 -1 -2   1 1 1   0   0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  2 -1 -4   1 1 1   0   0   0.5   0 1 1 500  0.3 1 0.8
SPHERE  0  1 -2   1 1 1   0.5 0   0     0 1 1 500  0.3 1 0.8
SPHERE -2  1 -2   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE -2 -1 -2   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  2  1 -6   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  2 -1 -6   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  0 -1 -2   1 1 1   0   0.5 0     0 1 1 500  0.3 1 0.8
LIGHT  5 2 6   1   1 1
LIGHT  6 4 2   1 0.4 1
BACK    0.4 0.3 0.1
AMBIENT 0.2 0.2 0.2
`
};
