package com.clinicappoint.clinic.ServiceImp;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.clinicappoint.clinic.Entity.DataEntity;
import com.clinicappoint.clinic.Entity.LLM;
import com.clinicappoint.clinic.Repository.DataRepository;
import com.clinicappoint.clinic.Repository.LLMRepository;
import com.clinicappoint.clinic.Service.LLMService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LLMServiceImpl implements LLMService {

    @Autowired
    private LLMRepository llmRepository;

    @Autowired
    private DataRepository dataRepository; // 注入 DataRepository

    Generation gen = new Generation();

    @Override
    public LLM generateResponse() {
        try {
            // 从数据库中获取所有 DataEntity 数据
            List<DataEntity> Data = dataRepository.findAll();

            List<DataEntity> allData = Data.stream()
                    .limit(10) // 限制到 10 个数据
                    .collect(Collectors.toList());

            String dataContent = allData.stream()
                    .map(DataEntity::getValue)
                    .reduce("", (acc, val) -> acc + " " + val);

            // 创建系统消息和用户消息
            Message systemMsg = Message.builder()
                    .role(Role.SYSTEM.getValue())
                    .content(
                            "你好，你现在是一个医疗助手，接下来我会给你发一下一位用我们智能医疗分析产品的用户的数据，其中HR指的是心率、HRV指的是心率变异性，请你用中文回答关于对这个患者的健康分析与建议") // 系统消息内容
                    .build();
            Message userMsg = Message.builder()
                    .role(Role.USER.getValue())
                    .content(dataContent) // 使用转换后的数据内容
                    .build();

            // 构建 GenerationParam 参数
            GenerationParam param = GenerationParam.builder()
                    .model("qwen-turbo-latest") // 更新模型名称
                    .messages(Arrays.asList(systemMsg, userMsg))
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .topK(50)
                    .temperature(0.8f)
                    .topP(0.8)
                    .seed(1234)
                    .apiKey("sk-9f6d0e6333524b41a0ff75d8d88b1394")
                    .build();

            // 调用大模型生成回答
            GenerationResult result = gen.call(param);

            // 将大模型的回答封装到 LLM 对象中
            LLM llm = new LLM();
            llm.setContent(result.getOutput().getChoices().get(0).getMessage().getContent());

            // 保存 LLM 对象到数据库
            llmRepository.save(llm);

            return llm;

        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            // 使用日志框架记录异常信息
            System.err.println("An error occurred while calling the generation service: " + e.getMessage());
            return null;
        }
    }
}