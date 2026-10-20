// Original linear small-country diagram; all marked points lie on the curves.
export const tariffDiagram = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 480" role="img" aria-labelledby="title desc">
<title id="title">Small-country tariff: transfers and distortion losses</title>
<desc id="desc">Domestic supply rises and demand falls as price increases from Pw to Pw+t. Quantities are Qs0, Qs1, Qd1, Qd0. Area a is producer gain, c is revenue, and b plus d is deadweight loss. Curves are linear and imports remain positive.</desc>
<rect width="760" height="480" fill="white"/><defs><clipPath id="tariff-plot"><rect x="70" y="50" width="390" height="360"/></clipPath></defs>
<g font-family="system-ui,sans-serif" font-size="16" fill="#17233b">
<text x="28" y="26">Price</text><path d="M70 50V410H460" stroke="#17233b" stroke-width="2" fill="none"/>
<g clip-path="url(#tariff-plot)">
<path d="M70 260H220L160 320H70Z" fill="#dbeafe"/>
<path d="M160 320L220 260V320Z" fill="#fed7aa" stroke="#9a3412"/>
<path d="M220 260H340V320H220Z" fill="#bbf7d0" stroke="#166534"/>
<path d="M340 260L400 320H340Z" fill="#fed7aa" stroke="#9a3412"/>
<path d="M130 50L460 380" stroke="#2454d8" stroke-width="3" fill="none"/>
<path d="M70 410L430 50" stroke="#148064" stroke-width="3" fill="none"/>
<path d="M70 320H460" stroke="#b45309" stroke-width="2" fill="none"/>
<path d="M70 260H460" stroke="#7c3aed" stroke-width="2" fill="none"/>
</g>
<text x="425" y="43" fill="#148064">S</text><text x="462" y="384" fill="#2454d8">D</text>
<text x="24" y="325">Pw</text><text x="6" y="265">Pw+t</text>
<g stroke="#64748b" stroke-dasharray="4 4"><path d="M160 320V410"/><path d="M220 260V410"/><path d="M340 260V410"/><path d="M400 320V410"/></g>
<text x="143" y="433">Qs0</text><text x="203" y="433">Qs1</text><text x="323" y="433">Qd1</text><text x="383" y="433">Qd0</text>
<text x="119" y="295">a</text><text x="199" y="306">b</text><text x="275" y="295">c</text><text x="347" y="306">d</text>
<text x="198" y="460">Domestic quantity</text>
<g font-size="15"><text x="495" y="90">Consumer loss: a+b+c+d</text><text x="495" y="125">Producer gain: a</text><text x="495" y="160">Revenue: c</text><text x="495" y="195">Production loss: b</text><text x="495" y="230">Consumption loss: d</text><text x="495" y="275">Net domestic loss: b+d</text><text x="495" y="330">Revenue = t (Qd1−Qs1)</text></g>
</g></svg>\n`;
