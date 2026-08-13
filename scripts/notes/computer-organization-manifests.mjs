const leaf = (id, title, startLine, endLine) => ({ id, title, startLine, endLine, children: [] });
const section = (id, title, children) => ({ id, title, children });

export const computerOrganizationChapters = [
  {
    number: 2, slug: "data-representation-and-operations", title: "数据的表示和运算", sourcePrefix: "第二章+",
    nodes: [
      section("2-1", "2.1 数制与编码", [leaf("2-1-number-systems", "进位计数制", 1, 14), leaf("2-1-machine-numbers", "真值与机器数", 15, 20), leaf("2-1-fixed-point", "定点数的表示", 21, 80)]),
      section("2-2", "2.2 运算方法和运算电路", [leaf("2-2-logic", "逻辑门电路", 81, 90), leaf("2-2-adders", "加法器", 91, 144), leaf("2-2-alu", "多路选择器、三态门与 ALU", 145, 168), leaf("2-2-shifts", "移位运算", 169, 226), leaf("2-2-add-sub", "定点数的加减法运算", 227, 278), leaf("2-2-multiply-divide", "乘除法与扩展", 279, 304)]),
      section("2-3", "2.3 浮点数的表示和运算", [leaf("2-3-normalization", "规格化", 305, 328), leaf("2-3-ieee754", "IEEE 754", 329, 356), leaf("2-3-arithmetic", "浮点数加减运算", 357, 378)]),
    ],
  },
  {
    number: 3, slug: "memory-systems", title: "存储系统", sourcePrefix: "第三章+",
    nodes: [
      section("3-1", "3.1 存储系统概述", [leaf("3-1-hierarchy", "存储系统层次", 1, 12), leaf("3-1-classification", "存储器的分类", 13, 86), leaf("3-1-indicators", "磁盘的性能指标", 87, 102)]),
      section("3-2", "3.2 主存储器", [leaf("3-2-basics", "基本组成", 103, 126), leaf("3-2-ram", "SRAM 和 DRAM", 127, 166), leaf("3-2-rom", "只读存储器 ROM", 167, 182), leaf("3-2-optimization", "内存优化技术", 183, 208), leaf("3-2-cpu", "主存储器与 CPU 的连接", 209, 234)]),
      section("3-4", "3.4 外部存储器", [leaf("3-4-disk", "磁盘存储器", 235, 314), leaf("3-4-raid", "磁盘阵列 RAID", 315, 340), leaf("3-4-ssd", "固态硬盘", 341, 384)]),
      section("3-5", "3.5 高速缓冲存储器", [leaf("3-5-locality", "局部性原理", 385, 396), leaf("3-5-principle", "基本工作原理", 397, 406), leaf("3-5-mapping", "Cache 和主存的映射方式", 407, 420), leaf("3-5-replacement", "Cache 替换算法", 421, 440), leaf("3-5-write", "Cache 写策略", 441, 462), leaf("3-5-levels", "多级 Cache", 463, 468)]),
    ],
  },
  {
    number: 4, slug: "instruction-set", title: "指令系统", sourcePrefix: "第四章+",
    nodes: [
      section("4-1", "4.1 指令系统", [leaf("4-1-definition", "指令与 ISA", 1, 24), leaf("4-1-format", "指令格式", 25, 98), leaf("4-1-operation", "按操作类型分类", 99, 132)]),
      section("4-2", "4.2 指令的寻址方式", [leaf("4-2-instruction", "指令寻址", 133, 144), leaf("4-2-data", "数据寻址", 145, 244)]),
      section("4-3", "4.3 程序的机器级代码表示", [leaf("4-3-format", "AT&T 格式与 Intel 格式", 245, 254), leaf("4-3-selection", "选择语句", 255, 268), leaf("4-3-loop", "循环语句", 269, 278), leaf("4-3-function", "函数调用", 279, 314)]),
      section("4-4", "4.4 CISC 和 RISC", [leaf("4-4-comparison", "CISC 与 RISC", 315, 340), leaf("4-4-process", "计算机的工作过程", 341, 344)]),
    ],
  },
  {
    number: 5, slug: "central-processing-unit", title: "中央处理器", sourcePrefix: "第五章+",
    nodes: [
      section("5-1", "5.1 CPU 的功能和基本结构", [leaf("5-1-functions", "CPU 的功能", 1, 16), leaf("5-1-structure", "CPU 的基本结构", 17, 46)]),
      section("5-2", "5.2 指令执行过程", [leaf("5-2-cycle", "指令周期", 47, 58), leaf("5-2-dataflow", "指令周期的数据流", 59, 102), leaf("5-2-schemes", "指令执行方案", 103, 122)]),
      section("5-3", "5.3 数据通路的功能和基本结构", [leaf("5-3-definition", "异常、中断与数据通路", 123, 138), leaf("5-3-structures", "数据通路的基本结构", 139, 164)]),
      section("5-4", "5.4 控制器的功能和工作原理", [leaf("5-4-hardwired", "硬布线控制器", 165, 196), leaf("5-4-microprogram", "微程序控制器", 197, 268), leaf("5-4-comparison", "硬布线与微程序的比较", 269, 272)]),
      section("5-5", "5.5 异常和中断机制", [leaf("5-5-types", "异常与中断的类型", 273, 322), leaf("5-5-response", "异常和中断的响应过程", 323, 348)]),
      section("5-6", "5.6 指令流水线", [leaf("5-6-definition", "定义与执行方式", 349, 380), leaf("5-6-diagrams", "流水线表示方式", 381, 394), leaf("5-6-performance", "流水线的性能指标", 395, 448), leaf("5-6-hazards", "影响流水线的因素", 449, 500), leaf("5-6-classification", "流水线的分类", 501, 540), leaf("5-6-multiple-issue", "流水线的多发技术", 541, 558), leaf("5-6-five-stage", "五段式指令流水线", 559, 572)]),
    ],
  },
  {
    number: 6, slug: "buses", title: "总线", sourcePrefix: "第六章+",
    nodes: [
      section("6-1", "6.1 总线概述", [leaf("6-1-definition", "定义、特点与特性", 1, 28), leaf("6-1-classification", "总线的分类", 29, 94), leaf("6-1-performance", "性能指标", 95, 116)]),
      section("6-2", "6.2 总线事务和定时", [leaf("6-2-cycle", "总线周期", 117, 130), leaf("6-2-timing", "总线定时", 131, 152)]),
    ],
  },
  {
    number: 7, slug: "input-output-systems", title: "输入/输出系统", sourcePrefix: "第七章+",
    nodes: [
      section("7-2", "7.2 I/O 接口", [leaf("7-2-definition", "定义与作用", 1, 20), leaf("7-2-structure", "基本结构", 21, 38), leaf("7-2-addressing", "I/O 端口的编址方式", 39, 60), leaf("7-2-types", "I/O 接口的类型", 61, 82)]),
      section("7-3", "7.3 I/O 方式", [leaf("7-3-query", "程序查询方式", 83, 92), leaf("7-3-interrupt", "程序中断方式", 93, 186), leaf("7-3-dma", "DMA 方式", 187, 240)]),
    ],
  },
];
